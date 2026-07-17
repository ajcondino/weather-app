import * as Localization from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './resources/en/translation.json';

const resources = {
  en: { translation: en },
};

export function detectDeviceLanguage(): string {
  const languageCode = Localization.getLocales()[0]?.languageCode;
  return languageCode && languageCode in resources ? languageCode : 'en';
}

i18next.use(initReactI18next).init({
  resources,
  lng: detectDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export default i18next;
