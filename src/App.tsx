import { useEffect, type ComponentType } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import SolutionsPage from './pages/SolutionsPage';
import ProductsPage from './pages/ProductsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import AdminBlogPage from './pages/AdminBlogPage';
import LegalPage from './pages/LegalPage';
import LegalLandingPage from './pages/LegalLandingPage';
import DesignSystemPage from './pages/DesignSystemPage';
import NotFoundPage from './pages/NotFoundPage';
import { ROUTES, type RouteKey } from './i18n/routes';
import { shouldAutoRedirectToTurkish, useLocaleSync } from './i18n/useLocale';

/** Map of route key → page component. Both EN and TR routes render the same component. */
const PAGE_FOR_KEY: Record<RouteKey, ComponentType> = {
  home: HomePage,
  solutions: SolutionsPage,
  products: ProductsPage,
  about: AboutPage,
  contact: ContactPage,
  blog: BlogPage,
  blogPost: BlogPostPage,
  legal: LegalLandingPage,
  legalTerms: LegalPage,
  legalPrivacy: LegalPage,
  legalRisk: LegalPage,
  legalDisclaimer: LegalPage,
};

/** Runs once on first visit: if user's browser is TR and they hit EN,
 *  redirect to the TR equivalent. Gated by localStorage so we never loop. */
function BrowserLanguageRedirect() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const target = shouldAutoRedirectToTurkish(pathname);
    if (target) navigate(target, { replace: true });
    // intentionally run only on mount — this is a first-visit nudge, not
    // a per-navigation guard
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function LocaleShell() {
  useLocaleSync();
  return null;
}

export default function App() {
  return (
    <>
      <BrowserLanguageRedirect />
      <LocaleShell />
      <ScrollToTop />
      <Routes>
        {/* Generated routes — each page key registers both EN and TR paths. */}
        {(Object.keys(PAGE_FOR_KEY) as RouteKey[]).flatMap(key => {
          const Page = PAGE_FOR_KEY[key];
          return [
            <Route key={`${key}-en`} path={ROUTES[key].en} element={<Page />} />,
            <Route key={`${key}-tr`} path={ROUTES[key].tr} element={<Page />} />,
          ];
        })}

        {/* Internal-only pages — no TR variant needed */}
        <Route path="/admin" element={<AdminBlogPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
