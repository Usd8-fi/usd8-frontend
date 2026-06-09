<svg class="floating-logo" viewBox="0 0 105 105" width="170" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="usd8-ink" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="3" seed="7" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="20" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <mask id="usd8-reveal">
      <rect width="105" height="105" fill="black"/>
      <circle cx="52.5" cy="52.5" r="0" fill="white" filter="url(#usd8-ink)">
        <animate attributeName="r"
                 values="0;0;95"
                 keyTimes="0;0.15;1"
                 dur="5s" fill="freeze"
                 calcMode="spline"
                 keySplines="0 0 1 1; 0.22 0.61 0.36 1"/>
      </circle>
    </mask>
  </defs>
  <image href="/assets/usd8Logo.svg" width="105" height="105" mask="url(#usd8-reveal)"/>
</svg>
<br/><br/>

# USD8 <span class="coming-soon-pill">Building</span>

USD8 is a stablecoin with two baked-in functions — free Defi Insurance and Order Enforcement. 

## Free Defi Insurance 
USD8 users get Defi Insurance covering [multiple defi protocols](./cover-pool.md#covered-defi-protocols), across any position, up to 80%, completely free. Claims are onchain and permissionless. Funds come from USD8's [Cover Pool](./cover-pool.md). The more you use USD8, the more you are covered.

## Order Enforcement
After claims, USD8 curates a [White Hat Economy](./white-hat-economy.md), chasing lost assets on an ongoing basis — enforcing orders for the Defi space and deterring future hacks. 
<br/><br/><br/><br/>


# Security

Security is the core of USD8. We conduct security reviews on each protocol before we offer coverage. We also accept trusted independent security audits from the following
- [OpenZeppelin](https://www.openzeppelin.com/)
- [Trial of Bits](https://trailofbits.com/)
- [SEAL Certification from Security Alliance](https://frameworks.securityalliance.dev/certs/overview/)

<br/><br/><br/><br/>

# Use cases

1. For passive DeFi users who want their savings protected - Swap your stablecoins for USD8 and deposit into our [Protected Savings](protected-savings.md) to earn yield(est. 3-5%) while being protected. If this vault is hacked, you can claim upto 80% of your loss from the [Cover Pool](cover-pool.md).

2. For advanced DeFi users actively managing their own yield strategies - Hold USD8 (or USD8 LSTs with yield) and freely use any [Covered DeFi Protocols](cover-pool.md#covered-defi-protocols), now all your positions are protected by the Cover Pool.

3. For high-yield seekers with higher risk tolerance: deposit assets into our [Cover Pool](cover-pool.md) to share protocol revenue (estimated 15–30% returns). Be aware your assets might be used to offset losses from [Covered DeFi Protocols](cover-pool.md#covered-defi-protocols), but our security team screens every covered protocol to reduce the chance of incidents.
<br/><br/><br/><br/>

# Backed by USDC
<br/><img src="/assets/multiCollateral.png" height="150"/><br/><br/><br/>

USD8 can be minted 1:1 with USDC permissionlessly, these USDC collateral will be deployed to Defi platform for yield. Rest assured your USD8 is covered by the [Cover Pool](cover-pool.md) upto 80% incase anything goes wrong, you can redeem USD8 upto 80% value. 

Redeem USD8 back to USDC will be also be permissionless, while we expect this process to be instant there might be a delay for large redeems because some external defi protocol might have a delay in their redeeming process, which is out of our control. However there will be an AMM pool available for swaps at anytime.
<br/><br/><br/><br/>

# We are Crypto Native
We are crypto native — we live and breathe the decentralized dream and are committed to building projects that adhere as closely as possible to the [Trustless Manifesto](https://trustlessness.eth.limo/general/2025/11/11/the-trustless-manifesto.html). <br/><br/>[Join us](https://t.me/+e84i2oYk1ao1MTk1) if you share our vision.
