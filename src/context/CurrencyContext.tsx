import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrencyCode, getCurrencyByCode, getDefaultCurrencyForLanguage } from '../config/currencies';

interface CurrencyContextType {
    currency: CurrencyCode;
    setCurrency: (code: CurrencyCode) => void;
    formatPrice: (amountInEur: number) => string;
    formatAmount: (amountInEur: number) => string; // Number only, no symbol
    getCurrencySymbol: () => string;
    rates: Record<string, number>;
    loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Fallback exchange rates (approximate, will be updated from API)
const FALLBACK_RATES: Record<string, number> = {
    EUR: 1,
    USD: 1.05,
    GBP: 0.85,
    UAH: 42.0,
    RUB: 95.0,
    TRY: 32.0,
    PLN: 4.3,
    CZK: 24.5,
    HUF: 390.0,
    RON: 4.95,
    BRL: 5.4,
    CNY: 7.6,
    JPY: 155.0,
    THB: 36.0,
    IDR: 16500.0,
    INR: 92.0,
    KZT: 475.0,
    AZN: 1.8,
    AMD: 410.0,
    UZS: 12500.0,
    KGS: 90.0,
    TJS: 11.5,
    TWD: 33.0,
};

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
        const savedCurrency = localStorage.getItem('currency') as CurrencyCode;
        const savedLanguage = localStorage.getItem('language');

        // If currency is saved, use it
        if (savedCurrency) {
            return savedCurrency;
        }

        // Otherwise, get default currency for current language
        if (savedLanguage) {
            return getDefaultCurrencyForLanguage(savedLanguage);
        }

        return 'EUR';
    });

    const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
    const [loading, setLoading] = useState(false);

    // Function to fetch rates from exchangerate-api.com (free tier)
    const fetchRates = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
            const data = await response.json();

            if (data && data.rates) {
                setRates(data.rates);
            }
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            // Keep using fallback rates
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
        // Refresh rates every hour
        const interval = setInterval(fetchRates, 3600000);
        return () => clearInterval(interval);
    }, []);

    const setCurrency = (code: CurrencyCode) => {
        setCurrencyState(code);
        localStorage.setItem('currency', code);
    };

    const formatPrice = (amountInEur: number) => {
        const rate = rates[currency] || 1;
        const converted = amountInEur * rate;

        const currencyInfo = getCurrencyByCode(currency);
        const symbol = currencyInfo?.symbol || currency;

        // Format the number with proper thousands separators
        const formatted = Math.round(converted).toLocaleString('en-US');

        // Return with currency symbol
        // Special handling for currencies where symbol comes after the amount
        if (['CZK', 'RON', 'TRY', 'PLN', 'HUF'].includes(currency)) {
            return `${formatted} ${symbol}`;
        }

        return `${symbol} ${formatted}`;
    };

    const formatAmount = (amountInEur: number) => {
        const rate = rates[currency] || 1;
        const converted = amountInEur * rate;
        return Math.round(converted).toLocaleString('en-US');
    };

    const getCurrencySymbol = () => {
        const currencyInfo = getCurrencyByCode(currency);
        return currencyInfo?.symbol || currency;
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, formatAmount, getCurrencySymbol, rates, loading }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
