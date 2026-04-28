import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './en/common.json';
import trCommon from './tr/common.json';
import enHome from './en/home.json';
import trHome from './tr/home.json';
import enSolutions from './en/solutions.json';
import trSolutions from './tr/solutions.json';
import enProducts from './en/products.json';
import trProducts from './tr/products.json';
import enAbout from './en/about.json';
import trAbout from './tr/about.json';
import enContact from './en/contact.json';
import trContact from './tr/contact.json';
import enLegal from './en/legal.json';
import trLegal from './tr/legal.json';
import enAuth from './en/auth.json';
import trAuth from './tr/auth.json';
import enAdmin from './en/admin.json';
import trAdmin from './tr/admin.json';
import enDashboard from './en/dashboard.json';
import trDashboard from './tr/dashboard.json';

export const SUPPORTED_LANGUAGES = ['en', 'tr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * i18n init — resources are bundled (small site, sync load is fine).
 * Initial language is derived from URL pathname on the client; SSR/build
 * defaults to 'en'. `useLocaleSync()` keeps i18n in sync on route change.
 */
const initialLng: SupportedLanguage =
  typeof window !== 'undefined' && window.location.pathname.startsWith('/tr')
    ? 'tr'
    : 'en';

void i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      home: enHome,
      solutions: enSolutions,
      products: enProducts,
      about: enAbout,
      contact: enContact,
      legal: enLegal,
      auth: enAuth,
      admin: enAdmin,
      dashboard: enDashboard,
    },
    tr: {
      common: trCommon,
      home: trHome,
      solutions: trSolutions,
      products: trProducts,
      about: trAbout,
      contact: trContact,
      legal: trLegal,
      auth: trAuth,
      admin: trAdmin,
      dashboard: trDashboard,
    },
  },
  lng: initialLng,
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
