// i18next-scanner.config.js
export const input = [
  'src/**/*.{js,jsx,ts,tsx}',
  // Exclude specific directories
  '!src/**/*.spec.{js,jsx,ts,tsx}',
  '!src/i18n/**',
  '!**/node_modules/**',
];
export const output = './';
export const options = {
  debug: true,
  removeUnusedKeys: false,
  sort: true,
  func: {
    list: ['t', 'i18next.t', 'i18n.t'],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  trans: {
    component: 'Trans',
    i18nKey: 'i18nKey',
    defaultsKey: 'defaults',
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallbackKey: false,
  },
  lngs: ['en', 'fr', 'ar'],
  ns: ['translation'],
  defaultLng: 'en',
  defaultNs: 'translation',
  defaultValue: (lng, ns, key) => {
    if (lng === 'en') {
      return key;
    }
    return '';
  },
  resource: {
    loadPath: 'src/locales/{{lng}}/{{ns}}.json',
    savePath: 'src/locales/{{lng}}/{{ns}}.json',
    jsonIndent: 2,
    lineEnding: '\n',
  },
  nsSeparator: false,
  keySeparator: '.',
  interpolation: {
    prefix: '{{',
    suffix: '}}',
  },
};