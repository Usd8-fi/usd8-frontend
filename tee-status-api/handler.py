"""USD8 TEE status (read-only, public).

GET / -> JSON describing the claim-verification TEE fleet as AWS sees it:
workers currently alive, the enclave image the job API launches, its budgets,
and the janitor schedule. Nothing here is a secret; nothing is mutable through
this function. Watches the MAINNET job API (env USD8_JOB_API_FUNCTION=
usd8-tee-job-api-mainnet, ROLE=USD8TeeMainnetLambdaRole, POLICY=
USD8TeeMainnetLambdaPolicy); the Sepolia job API is retired. Identifiers that reveal network layout (subnet, security group,
bucket, account) are deliberately not returned.
"""
import json
import os
import time
from datetime import datetime, timezone

import boto3

REGION = os.environ["AWS_REGION"]
JOB_API = os.environ["USD8_JOB_API_FUNCTION"]
JANITOR = os.environ["USD8_JANITOR_FUNCTION"]
JANITOR_RULE = os.environ["USD8_JANITOR_RULE"]
JOB_API_ROLE = os.environ["USD8_JOB_API_ROLE"]
JOB_API_POLICY = os.environ["USD8_JOB_API_POLICY"]
WORKER_TAG = os.environ.get("USD8_WORKER_TAG", "USD8-TEE")
CACHE_SECONDS = int(os.environ.get("USD8_STATUS_CACHE_SECONDS", "60"))

ec2 = boto3.client("ec2")
lam = boto3.client("lambda")
events = boto3.client("events")
cloudwatch = boto3.client("cloudwatch")
iam = boto3.client("iam")


def iso(value):
    return value.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ") if value else None


def workers():
    paginator = ec2.get_paginator("describe_instances")
    rows = []
    for page in paginator.paginate(Filters=[
        {"Name": "tag:Project", "Values": [WORKER_TAG]},
        {"Name": "instance-state-name", "Values": ["pending", "running", "stopping", "stopped", "shutting-down"]},
    ]):
        for reservation in page.get("Reservations", []):
            for instance in reservation.get("Instances", []):
                rows.append({
                    "instanceId": instance["InstanceId"],
                    "state": instance["State"]["Name"],
                    "instanceType": instance.get("InstanceType"),
                    "imageId": instance.get("ImageId"),
                    "launchedAt": iso(instance.get("LaunchTime")),
                })
    rows.sort(key=lambda row: row["launchedAt"] or "", reverse=True)
    return rows


def image(image_id):
    if not image_id:
        return None
    found = ec2.describe_images(ImageIds=[image_id]).get("Images", [])
    if not found:
        return {"imageId": image_id, "name": None, "createdAt": None, "available": False}
    img = found[0]
    return {
        "imageId": image_id,
        "name": img.get("Name"),
        "createdAt": img.get("CreationDate"),
        "available": img.get("State") == "available",
    }


def env_of(function_name):
    config = lam.get_function_configuration(FunctionName=function_name)
    return config.get("Environment", {}).get("Variables", {}), config


def approved_launch():
    """What the job API is *allowed* to launch, from its IAM policy: the only
    permitted image ARN(s) and the instance type condition. This is the enforced
    allowlist, not a configuration value, so it cannot drift from reality."""
    doc = iam.get_role_policy(RoleName=JOB_API_ROLE, PolicyName=JOB_API_POLICY)["PolicyDocument"]
    images, instance_type = [], None
    for statement in doc.get("Statement", []):
        resources = statement.get("Resource", [])
        resources = [resources] if isinstance(resources, str) else resources
        images += [r.rsplit("/", 1)[1] for r in resources if "::image/ami-" in r]
        condition = statement.get("Condition", {}).get("StringEquals", {})
        instance_type = condition.get("ec2:InstanceType", instance_type)
    return sorted(set(images)), instance_type


def invocations(function_name, hours):
    end = datetime.now(timezone.utc)
    start = end.replace(microsecond=0) - __import__("datetime").timedelta(hours=hours)
    out = cloudwatch.get_metric_statistics(
        Namespace="AWS/Lambda", MetricName="Invocations",
        Dimensions=[{"Name": "FunctionName", "Value": function_name}],
        StartTime=start, EndTime=end, Period=hours * 3600, Statistics=["Sum"],
    )
    points = out.get("Datapoints", [])
    return int(points[0]["Sum"]) if points else 0


def starts_last_24h():
    # Worker launches are recorded as EC2 RunInstances by the job API role; the
    # cheapest faithful proxy without CloudTrail is the count of worker
    # instances launched in the window, including already-terminated ones.
    since = datetime.now(timezone.utc) - __import__("datetime").timedelta(hours=24)
    count = 0
    paginator = ec2.get_paginator("describe_instances")
    for page in paginator.paginate(Filters=[{"Name": "tag:Project", "Values": [WORKER_TAG]}]):
        for reservation in page.get("Reservations", []):
            for instance in reservation.get("Instances", []):
                if instance.get("LaunchTime") and instance["LaunchTime"] >= since:
                    count += 1
    return count


def status():
    _, job_config = env_of(JOB_API)
    janitor_env, _ = env_of(JANITOR)
    rule = events.describe_rule(Name=JANITOR_RULE)
    approved_images, instance_type = approved_launch()
    alive = workers()
    return {
        "generatedAt": iso(datetime.now(timezone.utc)),
        "region": REGION,
        "workers": {
            "alive": alive,
            "aliveCount": len(alive),
            "launchedLast24h": starts_last_24h(),
            "instanceType": instance_type,
        },
        # Images the job API's IAM policy permits it to launch (normally exactly one).
        "approvedImages": [image(image_id) for image_id in approved_images],
        "jobApi": {
            "function": JOB_API,
            "lastModified": job_config.get("LastModified"),
            "timeoutSeconds": job_config.get("Timeout"),
            "invocationsLast24h": invocations(JOB_API, 24),
        },
        "janitor": {
            "function": JANITOR,
            "schedule": rule.get("ScheduleExpression"),
            "enabled": rule.get("State") == "ENABLED",
            "maxWorkerAgeSeconds": int(janitor_env.get("USD8_TEE_MAX_AGE_SECONDS", "0")),
            "runsLast24h": invocations(JANITOR, 24),
        },
    }


_cache = {"at": 0.0, "body": None}


def handler(event, _context):
    http = (event.get("requestContext") or {}).get("http") or {}
    if http.get("method") != "GET" or (event.get("rawPath") or "/") not in ("/", "/status"):
        return {"statusCode": 404, "headers": {"content-type": "application/json"}, "body": json.dumps({"error": "NOT_FOUND"})}
    now = time.time()
    if _cache["body"] is None or now - _cache["at"] > CACHE_SECONDS:
        try:
            _cache["body"] = json.dumps(status())
            _cache["at"] = now
        except Exception as error:  # noqa: BLE001 - surface as 503, never a stack trace
            print(f"tee status failed: {error!r}")
            if _cache["body"] is None:
                return {"statusCode": 503, "headers": {"content-type": "application/json", "cache-control": "no-store"},
                        "body": json.dumps({"error": "STATUS_UNAVAILABLE"})}
    return {
        "statusCode": 200,
        "headers": {"content-type": "application/json", "cache-control": f"public, max-age={CACHE_SECONDS}"},
        "body": _cache["body"],
    }
