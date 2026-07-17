import * as Localization from 'expo-localization';
import i18n, { detectDeviceLanguage } from '../index';

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'xx' }]),
}));

describe('i18n', () => {
  it('resolves a known key using the en resources', () => {
    expect(i18n.t('weatherPreview.cancel')).toBe('Cancel');
  });

  it('falls back to en when the device locale is unsupported', () => {
    expect(detectDeviceLanguage()).toBe('en');
  });

  it('resolves the matching locale when the device locale is supported', () => {
    (Localization.getLocales as jest.Mock).mockReturnValueOnce([{ languageCode: 'en' }]);
    expect(detectDeviceLanguage()).toBe('en');
  });
});
