import { createInstance, i18n as I18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { zh, en, ja } from '@/locales'

const i18n: I18nInstance = createInstance({
  fallbackLng: 'zh',
  debug: true,
  interpolation: {
    escapeValue: false,
  },

  resources: {
    zh: { translation: zh },
    en: { translation: en },
    ja: { translation: ja }
  }
});

i18n.use(initReactI18next).init();

export default i18n;