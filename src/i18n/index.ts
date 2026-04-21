import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import trCommon from './locales/tr/common.json';
import enHome from './locales/en/home.json';
import trHome from './locales/tr/home.json';
import enSolutions from './locales/en/solutions.json';
import trSolutions from './locales/tr/solutions.json';
import enProducts from './locales/en/products.json';
import trProducts from './locales/tr/products.json';
import enAbout from './locales/en/about.json';
import trAbout from './locales/tr/about.json';
import enContact from './locales/en/contact.json';
import trContact from './locales/tr/contact.json';
import enLegal from './locales/en/legal.json';
import trLegal from './locales/tr/legal.json';

export const SUPPORTED_LANGUAGES = ['en', 'tr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * i18n init — resources are bundled (small site, sync load is fine).
 * Language is driven by URL, not auto-detected at this layer; the
 * LocaleProvider calls `i18n.changeLanguage()` based on route.
 */
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
    },
    tr: {
      common: trCommon,
      home: trHome,
      solutions: trSolutions,
      products: trProducts,
      about: trAbout,
      contact: trContact,
      legal: trLegal,
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
