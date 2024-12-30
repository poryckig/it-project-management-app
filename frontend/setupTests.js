import '@testing-library/jest-dom';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { TextEncoder, TextDecoder } from 'util';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: { en: { translation: {} } },
});

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;