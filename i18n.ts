import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import en from './locales/en.json';
import ru from './locales/ru.json';

const locales = RNLocalize.getLocales();
const systemLang = locales[0]?.languageCode || 'en';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    lng: systemLang,
    fallbackLng: 'en',
    resources: {
        en: { translation: en },
        ru: { translation: ru },
    },
    interpolation: {
      escapeValue: false,
    },
  }).then(() => {
    console.log('i18n initialized successfully');
    console.log('Current language:', i18n.language);
    console.log('Available languages:', Object.keys(i18n.options.resources || {}));
    console.log('EN resources:', i18n.store.data.en);
  });

export default i18n;
