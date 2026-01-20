export type CurrencyCode =
    | 'AZN' | 'CZK' | 'EUR' | 'GBP' | 'USD' | 'HUF' | 'AMD' | 'IDR'
    | 'JPY' | 'KGS' | 'KZT' | 'PLN' | 'BRL' | 'RON' | 'RUB' | 'THB'
    | 'TJS' | 'TRY' | 'UAH' | 'UZS' | 'CNY' | 'TWD';

export interface Currency {
    code: CurrencyCode;
    name: string;
    symbol: string;
    flag: string;
    countryCode: string;
}

export const currencies: Currency[] = [
    { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', flag: '🇦🇿', countryCode: 'az' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿', countryCode: 'cz' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', countryCode: 'eu' },
    { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', countryCode: 'gb' },
    { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', countryCode: 'us' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺', countryCode: 'hu' },
    { code: 'AMD', name: 'Armenian Dram', symbol: '֏', flag: '🇦🇲', countryCode: 'am' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩', countryCode: 'id' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', countryCode: 'jp' },
    { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'с', flag: '🇰🇬', countryCode: 'kg' },
    { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', flag: '🇰🇿', countryCode: 'kz' },
    { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', flag: '🇵🇱', countryCode: 'pl' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', countryCode: 'br' },
    { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴', countryCode: 'ro' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺', countryCode: 'ru' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', countryCode: 'th' },
    { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'ЅМ', flag: '🇹🇯', countryCode: 'tj' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', countryCode: 'tr' },
    { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', flag: '🇺🇦', countryCode: 'ua' },
    { code: 'UZS', name: 'Uzbekistani Som', symbol: 'so\'m', flag: '🇺🇿', countryCode: 'uz' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', countryCode: 'cn' },
    { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼', countryCode: 'tw' },
];

// Map language codes to default currencies
export const languageToCurrency: Record<string, CurrencyCode> = {
    'az': 'AZN',
    'cs': 'CZK',
    'de': 'EUR',
    'en-GB': 'GBP',
    'en-US': 'USD',
    'es': 'EUR',
    'fr': 'EUR',
    'hu': 'HUF',
    'hy': 'AMD',
    'id': 'IDR',
    'it': 'EUR',
    'ja': 'JPY',
    'kg': 'KGS',
    'kz': 'KZT',
    'nl': 'EUR',
    'pl': 'PLN',
    'pt-BR': 'BRL',
    'ro': 'RON',
    'ru': 'RUB',
    'th': 'THB',
    'tj': 'TJS',
    'tr': 'TRY',
    'uk': 'UAH',
    'uz': 'UZS',
    'zh-CN': 'CNY',
    'zh-TW': 'TWD',
};

// Helper function to get currency by code
export const getCurrencyByCode = (code: CurrencyCode): Currency | undefined => {
    return currencies.find(c => c.code === code);
};

// Helper function to get default currency for a language
export const getDefaultCurrencyForLanguage = (languageCode: string): CurrencyCode => {
    return languageToCurrency[languageCode] || 'EUR';
};
