export type LanguageCode =
    | 'cs' // Čeština
    | 'de' // Deutsch
    | 'en-GB' // English (UK)
    | 'en-US' // English (US)
    | 'es' // Español
    | 'fr' // Français
    | 'hu' // Magyar
    | 'id' // Bahasa Indonesia
    | 'it' // Italiano
    | 'ja' // 日本語
    | 'nl' // Nederlands
    | 'pl' // Polski
    | 'pt-BR' // Português (Brasil)
    | 'ro' // Română
    | 'ru' // Русский
    | 'th' // ภาษาไทย
    | 'tr' // Türkçe
    | 'uk' // Українська
    | 'zh-CN' // 中文 (简体)
    | 'zh-TW'; // 中文 (繁體)

export interface Translation {
    common: {
        dashboard: string;
        allExpenses: string;
        billsSubscription: string;
        investment: string;
        cards: string;
        goals: string;
        analytics: string;
        settings: string;
        logout: string;
        searchPlaceholder: string;
        addExpense: string;
        addCard: string;
        edit: string;
        delete: string;
        save: string;
        cancel: string;
        confirm: string;
        actions: string;
        loading: string;
        darkMode: string;
        lightMode: string;
        profile: string;
        totalBalance: string;
        monthlyExpenses: string;
        welcomeBack: string;
        manageCards: string;
        expensesList: string;
    };
    expenses: {
        amount: string;
        category: string;
        date: string;
        description: string;
        paymentMode: string;
        paymentModeCash: string;
        paymentModeCard: string;
        paymentModeBank: string;
        paymentModeWallet: string;
        paymentModeOther: string;
        noExpenses: string;
    };
    cards: {
        cardName: string;
        bank: string;
        noCards: string;
        addFirstCard: string;
        deleteTitle: string;
        deleteMessage: string;
    };
}
