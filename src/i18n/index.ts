
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importe os arquivos de tradução
import en from '@/locales/en/translation.json';
import pt from '@/locales/pt/translation.json';

i18n
  .use(initReactI18next) // Conecta i18next com React
  .init({
    resources: { // Define os recursos de tradução
      en: { translation: en },
      pt: { translation: pt }
    },
    lng: 'pt', // Idioma padrão
    fallbackLng: 'pt', // Idioma de fallback caso uma chave não seja encontrada
    interpolation: {
      escapeValue: false, // Não escapar HTML, pois o React já faz isso
    },
  });

export default i18n;
