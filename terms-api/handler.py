"""USD8 terms-acceptance recorder (write-only).

POST {"address": "0x...", "termsVersion": "YYYY-MM-DD"} -> 204
Stores address, terms version, terms text hash and acceptance times in DynamoDB.
No IP address, user agent, or signature is stored. There is deliberately no
read endpoint: only operators can read the table in AWS.
"""
import json
import os
import re
from datetime import datetime, timezone

import boto3

TABLE = boto3.resource("dynamodb").Table(os.environ["TERMS_TABLE"])
# {"2026-10-15": "<sha256 of the published legal text>"}
VERSIONS = json.loads(os.environ["TERMS_VERSIONS_JSON"])
ADDRESS = re.compile(r"^0x[0-9a-fA-F]{40}$")
MAX_BODY = 512


def response(status, body=None):
    return {
        "statusCode": status,
        "headers": {"content-type": "application/json", "cache-control": "no-store"},
        "body": json.dumps(body) if body is not None else "",
    }


def handler(event, _context):
    http = (event.get("requestContext") or {}).get("http") or {}
    if http.get("method") != "POST" or (event.get("rawPath") or "/") not in ("/", "/terms"):
        return response(404, {"error": "NOT_FOUND"})
    raw = event.get("body") or ""
    if event.get("isBase64Encoded"):
        return response(400, {"error": "INVALID_REQUEST"})
    if len(raw) > MAX_BODY:
        return response(413, {"error": "TOO_LARGE"})
    try:
        body = json.loads(raw)
        address = body["address"]
        version = body["termsVersion"]
    except (ValueError, KeyError, TypeError):
        return response(400, {"error": "INVALID_REQUEST"})
    if not isinstance(address, str) or not ADDRESS.match(address) or version not in VERSIONS:
        return response(400, {"error": "INVALID_REQUEST"})
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    TABLE.update_item(
        Key={"pk": f"{address.lower()}#{version}"},
        UpdateExpression=(
            "SET address = :a, termsVersion = :v, termsSha256 = :h, lastAcceptedAt = :t, "
            "firstAcceptedAt = if_not_exists(firstAcceptedAt, :t) ADD acceptCount :one"
        ),
        ExpressionAttributeValues={
            ":a": address.lower(), ":v": version, ":h": VERSIONS[version], ":t": now, ":one": 1,
        },
    )
    return response(204)
