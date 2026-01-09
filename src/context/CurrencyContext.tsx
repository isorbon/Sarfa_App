import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CurrencyCode = 'EUR' | 'USD' | 'UAH';

interface CurrencyContextType {
    currency: CurrencyCode;
    setCurrency: (code: CurrencyCode) => void;
    formatPrice: (amountInEur: number) => string;
    rates: Record<string, number>;
    loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);



const FALLBACK_RATES: Record<string, number> = {
    EUR: 1,
    USD: 1.05, // Approx
    UAH: 42.0  // Approx
};

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
        return (localStorage.getItem('currency') as CurrencyCode) || 'EUR';
    });
    const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
    const [loading, setLoading] = useState(false);

    // Function to fetch rates from Wise
    const fetchRates = async () => {
        setLoading(true);
        try {
            // Try fetching EUR -> USD
            const usdRes = await fetch('https://api.wise.com/v1/rates?source=EUR&target=USD');
            const usdData = await usdRes.json();

            // Try fetching EUR -> UAH
            const uahRes = await fetch('https://api.wise.com/v1/rates?source=EUR&target=UAH');
            const uahData = await uahRes.json();

            const newRates = { ...FALLBACK_RATES };

            if (usdData && usdData.length > 0) {
                newRates.USD = usdData[0].rate;
            }

            if (uahData && uahData.length > 0) {
                newRates.UAH = uahData[0].rate;
            }

            setRates(newRates);
        } catch (error) {
            console.error('Error fetching exchange rates from Wise:', error);
            // Fallback is already set
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
    }, []);

    const setCurrency = (code: CurrencyCode) => {
        setCurrencyState(code);
        localStorage.setItem('currency', code);
    };

    const formatPrice = (amountInEur: number) => {
        const rate = rates[currency] || 1;
        const converted = amountInEur * rate;

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(converted);
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, rates, loading }}>
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
