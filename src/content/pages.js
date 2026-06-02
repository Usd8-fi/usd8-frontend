import DashboardPage from '../components/DashboardPage.jsx';
import BoostersPage from '../pages/BoostersPage.jsx';
import ContactPage from '../pages/ContactPage.jsx';
import CoverPoolPage from '../pages/CoverPoolPage.jsx';
import FaqsPage from '../pages/FaqsPage.jsx';
import HelpNeededPage from '../pages/HelpNeededPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import PhilosophyPage from '../pages/PhilosophyPage.jsx';
import Usd8Page from '../pages/Usd8Page.jsx';
import WhiteHatEconomyPage from '../pages/WhiteHatEconomyPage.jsx';

export const pages = [
  { id: 'usd8', title: 'USD8', navTitle: 'USD8', route: 'usd8.html', component: Usd8Page, includeInPrint: true },
  { id: 'philosophy', title: 'Philosophical Roots', navTitle: 'Philosophical Roots', route: 'philosophy.html', component: PhilosophyPage, includeInPrint: true },
  { id: 'cover-pool', title: 'Free DeFi Insurance', navTitle: 'Free DeFi Insurance', route: 'cover-pool.html', component: CoverPoolPage, includeInPrint: true },
  { id: 'boosters', title: 'Boosters', navTitle: 'Boosters', route: 'boosters.html', component: BoostersPage, navPill: 'LIVE', includeInPrint: true },
  { id: 'white-hat-economy', title: 'White Hat Economy', navTitle: 'White Hat Economy', route: 'white-hat-economy.html', component: WhiteHatEconomyPage, includeInPrint: true },
  { id: 'help-needed', title: 'Help Needed', navTitle: 'Help Needed', route: 'help-needed.html', component: HelpNeededPage, navPill: 'LIVE', includeInPrint: true },
  { id: 'faqs', title: 'FAQs', navTitle: 'FAQs', route: 'faqs.html', component: FaqsPage, includeInPrint: true },
  { id: 'contact', title: 'Contact & Branding', navTitle: 'Contact & Branding', route: 'contact.html', component: ContactPage, includeInPrint: true },
  { id: 'dashboard', title: 'Dashboard', navTitle: 'Dashboard', route: 'dashboard.html', component: DashboardPage, includeInPrint: false },
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
  component: NotFoundPage,
  includeInPrint: false,
};
