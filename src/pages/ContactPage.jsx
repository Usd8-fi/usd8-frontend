import { H1, PageBreak } from '../components/PagePrimitives.jsx';

export default function ContactPage() {
  return (
    <>
      <H1 id="contact">Contact</H1>

      <img src="/assets/my_avatar.png" width="150" alt="" />
      <br />

      <p>
        Hi I am the core dev behind USD8, during the day I work as a Security Researcher at OpenZeppelin. You can reach
        out to me via the following channels.
      </p>

      <ul>
        <li>telegram <a href="https://t.me/+e84i2oYk1ao1MTk1">https://t.me/+e84i2oYk1ao1MTk1</a></li>
        <li>X <a href="https://x.com/usd8_fi">@usd8_fi</a> or <a href="https://x.com/codephobic">@codephobic</a></li>
        <li>GitHub Discussions <a href="https://github.com/orgs/Usd8-fi/discussions">https://github.com/orgs/Usd8-fi/discussions</a></li>
      </ul>

      <PageBreak />
      <H1 id="branding-assets">Branding Assets</H1>
      <PageBreak count={3} />

      <img src="/assets/usd8Logo1000.png" width="150" alt="" />
      <PageBreak count={2} />
      <p>Round logo. <a href="./assets/usd8Logo.svg">SVG</a> or <a href="./assets/usd8Logo1000.png">1000px PNG</a></p>
      <PageBreak count={7} />

      <img src="/assets/usd8Logo21000.png" width="170" alt="" />
      <PageBreak count={2} />
      <p>Round logo with name. <a href="./assets/usd8Logo2.svg">SVG</a> or <a href="./assets/usd8Logo21000.png">1000px PNG</a></p>
      <PageBreak count={7} />

      <img src="/assets/usd8Logo31000.png" width="200" alt="" />
      <PageBreak count={2} />
      <p>White logo. <a href="./assets/usd8Logo3.svg">SVG</a> or <a href="./assets/usd8Logo31000.png">1000px PNG</a></p>
      <PageBreak count={7} />

      <img src="/assets/usd8Logo41000_example_with_white_bg.png" width="300" alt="" />
      <PageBreak count={2} />
      <p>Black logo. <a href="./assets/usd8Logo4.svg">SVG</a> or <a href="./assets/usd8Logo41000.png">1000px PNG</a></p>
    </>
  );
}
