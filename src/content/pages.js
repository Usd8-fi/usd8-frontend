import usd8 from '../usd8.md?raw';
import philosophy from '../philosophy.md?raw';
import protectedSavings from '../protected-savings.md?raw';
import coverPool from '../cover-pool.md?raw';
import boosters from '../boosters.md?raw';
import whiteHatEconomy from '../white-hat-economy.md?raw';
import helpNeeded from '../help-needed.md?raw';
import faqs from '../faqs.md?raw';
import contact from '../contact.md?raw';

export const pages = [
  { id: 'usd8', title: 'USD8', navTitle: 'USD8', route: 'usd8.html', source: usd8 },
  { id: 'philosophy', title: 'Philosophical Roots', navTitle: 'Philosophical Roots', route: 'philosophy.html', source: philosophy },
  { id: 'protected-savings', title: 'Protected Savings', navTitle: 'Protected Savings', route: 'protected-savings.html', source: protectedSavings },
  { id: 'cover-pool', title: 'Cover Pool', navTitle: 'Cover Pool', route: 'cover-pool.html', source: coverPool },
  { id: 'boosters', title: 'Boosters', navTitle: 'Boosters', route: 'boosters.html', source: boosters, navPill: 'LIVE' },
  { id: 'white-hat-economy', title: 'White Hat Economy', navTitle: 'White Hat Economy', route: 'white-hat-economy.html', source: whiteHatEconomy },
  { id: 'help-needed', title: 'Help Needed', navTitle: 'Help Needed', route: 'help-needed.html', source: helpNeeded, navPill: 'LIVE' },
  { id: 'faqs', title: 'FAQs', navTitle: 'FAQs', route: 'faqs.html', source: faqs },
  { id: 'contact', title: 'Contact & Branding', navTitle: 'Contact & Branding', route: 'contact.html', source: contact },
  { id: 'dashboard', title: 'Dashboard', navTitle: 'Dashboard', route: 'dashboard.html', source: '' },
];

export const routeToPage = new Map([
  ['index.html', pages[0]],
  ['', pages[0]],
  ...pages.map((page) => [page.route, page]),
]);

export const notFoundPage = {
  id: 'not-found',
  title: 'Page not found',
  navTitle: 'Page not found',
  route: '404.html',
  source: '# Document not found (404)\n\nThis URL is invalid, sorry. Please use the navigation to continue.',
};
