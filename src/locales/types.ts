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
    | 'kg' // Кыргызча
    | 'kz' // Қазақша
    | 'nl' // Nederlands
    | 'pl' // Polski
    | 'pt-BR' // Português (Brasil)
    | 'ro' // Română
    | 'ru' // Русский
    | 'th' // ภาษาไทย
    | 'tj' // Тоҷикӣ
    | 'tr' // Türkçe
    | 'uk' // Українська
    | 'uz' // Oʻzbekcha
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
        totalExpenses: string;
        count: string;
        general: string;
        tools: string;
        trackTagline: string;
        helpCenter: string;
        support: string;
    };
    expenses: {
        amount: string;
        category: string;
        subCategory: string;
        date: string;
        description: string;
        paymentMode: string;
        paymentModeCash: string;
        paymentModeCard: string;
        paymentModeBank: string;
        paymentModeWallet: string;
        paymentModeOther: string;
        noExpenses: string;
        deleteTitle: string;
        deleteMessage: string;
        icon: string;
        mode: string;
    };
    cards: {
        cardName: string;
        bank: string;
        noCards: string;
        addFirstCard: string;
        deleteTitle: string;
        deleteMessage: string;
        selectCard: string;
        noCardsAvailable: string;
        namePlaceholder: string;
        bankPlaceholder: string;
    };
    bills: {
        totalMonthly: string;
        upcoming: string;
        overdue: string;
        total: string;
        trendMonthly: string;
        trendUpcoming: string;
        trendOverdue: string;
        trendTotal: string;
        allTime: string;
        moreFilters: string;
        statusOverdue: string;
        statusDueSoon: string;
        statusActive: string;
    };
    dashboard: {
        subtitle: string;
        totalInvestment: string;
        investAmount: string;
        required: string;
        collected: string;
        topCategory: string;
        viewDetails: string;
        moreThanLastMonth: string;
        lessThanLastMonth: string;
        vsLastMonth: string;
        periods: {
            m3: string;
            m6: string;
            month: string;
            year: string;
            lastYear: string;
        };
    };
    modals: {
        addExpenseTitle: string;
        editExpenseTitle: string;
        addCardTitle: string;
        editCardTitle: string;
        saving: string;
    };
    settings: {
        subtitle: string;
        avatar: string;
        upload: string;
        avatarUrlPlaceholder: string;
        avatarHelp: string;
        fullName: string;
        currency: string;
        currencyHelp: string;
        changePassword: string;
        newPassword: string;
        repeatPassword: string;
        updatePassword: string;
        passwordMismatch: string;
        passwordMinLength: string;
        passwordChanged: string;
        passwordChangeError: string;
        avatarUpdated: string;
        avatarUploadError: string;
        avatarUrlSaved: string;
        avatarUrlError: string;
        nameSaved: string;
        nameError: string;
        currencyUpdated: string;
        currencyError: string;
    };
    filters: {
        all: string;
        foodGrocery: string;
        investment: string;
        shopping: string;
        travelling: string;
        miscellaneous: string;
        bills: string;
        recent: string;
    };
    months: {
        short: {
            jan: string;
            feb: string;
            mar: string;
            apr: string;
            may: string;
            jun: string;
            jul: string;
            aug: string;
            sep: string;
            oct: string;
            nov: string;
            dec: string;
        };
    };
}
