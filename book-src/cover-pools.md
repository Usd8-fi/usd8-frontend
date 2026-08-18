# Cover Pools

Cover Pools are public vaults anyone can deposit and withdraw at any time. Cover Pools

- accepts a specific token as deposit e.g. wstEth
- pays an APY in USD8 funded by USD8's treasury yield
- capped size

<div class="example-box">
  Warning - Cover Pool asset will be used to cover claims if any insured token suffers a price drop >= 20%.
</div>


## Insured Tokens

Insured tokens are carefully evaluated, selected and adjusted on an ongoing basis. USD8 accepts independent security audits or certificates from the following sources.

- [OpenZeppelin](https://www.openzeppelin.com/) 
- [Trail of Bits](https://trailofbits.com/)
- [Consensys Deligence](https://diligence.security/)
- [SEAL Certification from Security Alliance](https://frameworks.securityalliance.dev/certs/overview/) 


## Withdraw

Withdraw has a 7 day cool down window, can be requested at anytime when there are no active claims. 

If new claims are made during this time, cool down can be extended for another 9-12 days during beta (6-9 days after beta) from the first claim. 

Assets in cool down do not gain yield and are still covering claims. Assets are withdrawable after cool down at anytime, they do not cover any claims nor gain yield anymore.


## Payout Limit

There is a limit for each payout from Cover Pool, currently set at 50%, meaning max payout of each incident is capped at 50% size of the current Cover Pool.