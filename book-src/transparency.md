# Transparency 

Here are the trust assumptions and risks involved in USD8 protocol. Most of these are commonly found in Defi protocols, we choose to declare these up-front to our users.

## Admin & Timelock
Admin privileges was reduced as much as possible during the design, most critical actions are performed through the timelock, which allows extra time for users to react to any upcoming changes.

Admin is allowed to perform system settings like 
- Deploy USD8 treasury to pre-approved strategies, but can't directly add strategies 
- Manage pausing, revenue weights, protocol fee, cover pool deposit caps

Timelock manages sensitive system settings
- Add/remove admins or replace the timelock
- Configure pools, insured tokens, scoring, oracles, incident/exit timing, claim bonds and TEE signers
- Manage Treasury strategies and revenue distribution.
- Permanently call endBetaMode, disabling upgrades and beta settlement corrections


## During Beta
Beta has a few extra safety training wheels which gives admin and timelock extra privileges.

- Admin or Timelock can correct settlement root, which also adds a 3 day dispute window to the claim process

- Timelock can upgrade Registry, USD8, Treasury, and DefiInsurance

Both will be removed once beta ends.


## Defi Insurance
Defi Insurance is free for all USD8/sUSD8 users, however the payout amount can vary based on claimers' insurance scores and Cover Pool size limit. 

We designed a process to allow users the freedom to accept or reject the payout in case it's not up to expectation.


## Cover Pool
Cover pools are more risky because they are used to cover claims. Our team carefully vets each individual token we insure to reduce the risk as much as possible, see [How do you reduce the Cover Pool LP risk?](./faqs.md#how-do-you-reduce-the-cover-pool-lp-risk). 

Cover Pool LPs should be aware of the risk.


## TEEs
USD8 system uses offchain TEEs to compute coverage, this means the current system relies on servers we operate. However we are planning to move to a trustless setup using zk-coprocessor networks in the future.


## External Services
USD8 relies on a few external services to function, such as 

- Chainlink Oracles 
- RPC providers
- Server/TEE providers (however we are planning to move to a trustless zk-coprocessor network in the future)
- Defi yield sources like Aave, Morpho etc

Any issues with these services might also impact USD8. 