import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import bnBD from './locales/bn-BD';
import enUS from './locales/en-US';

const resources = {
  'bn-BD': { translation: bnBD },
  'en-US': { translation: enUS },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'bn-BD', // Default language
  fallbackLng: 'en-US',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
export { resources };
