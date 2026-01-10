import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';
import { LanguageCode, Translation } from '../locales/types';

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    t: Translation;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<LanguageCode>('en-US');

    useEffect(() => {
        // Detect browser language
        const browserLang = navigator.language;
        // Try to match exact code first, then first part
        const supportedLangs = Object.keys(translations) as LanguageCode[];

        // Check if we have a saved preference
        const savedLang = localStorage.getItem('language') as LanguageCode;

        if (savedLang && supportedLangs.includes(savedLang)) {
            setLanguage(savedLang);
        } else {
            // Logic to fallback to close match or default
            const exactMatch = supportedLangs.find(lang => lang === browserLang);
            if (exactMatch) {
                setLanguage(exactMatch);
            } else {
                const partialMatch = supportedLangs.find(lang => lang.startsWith(browserLang.split('-')[0]));
                if (partialMatch) {
                    setLanguage(partialMatch);
                }
            }
        }
    }, []);

    useEffect(() => {
        if (translations[language]?.common?.appTitle) {
            document.title = translations[language].common.appTitle;
        }
    }, [language]);

    const handleSetLanguage = (lang: LanguageCode) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const value = {
        language,
        setLanguage: handleSetLanguage,
        t: translations[language],
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
