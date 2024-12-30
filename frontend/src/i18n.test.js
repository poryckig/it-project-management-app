import i18n from 'i18next';

jest.mock('i18next', () => {
  const actualI18n = jest.requireActual('i18next');
  return {
    ...actualI18n,
    use: jest.fn().mockReturnThis(),
    init: jest.fn(),
    changeLanguage: jest.fn(),
    t: jest.fn((key) => key),
  };
});

jest.mock('react-i18next', () => ({
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

jest.mock('i18next-http-backend', () => jest.fn());
jest.mock('i18next-browser-languagedetector', () => jest.fn());

describe('i18n configuration', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('changes language', () => {
    // Given
    require('./i18n');

    // When
    i18n.changeLanguage('fr');

    // Then
    expect(i18n.changeLanguage).toHaveBeenCalledWith('fr');
  });

  test('translates keys', () => {
    // Given
    require('./i18n');

    // When
    const translation = i18n.t('key');

    // Then
    expect(translation).toBe('key');
  });
});