export interface User {
    id: number;
    email: string;
    name: string;
    avatar_url?: string;
    currency?: string;
    theme?: string;
}

export interface Expense {
    id: number;
    user_id: number;
    amount: number;
    category: string;
    sub_category?: string;
    description?: string;
    icon: string;
    date: string;
    mode: string;
    created_at: string;
}

export interface Category {
    id: number;
    name: string;
    color: string;
    icon: string;
}

export interface DashboardStats {
    totalExpenses: number;
    monthlyExpenses: number;
    totalInvestment: number;
    accountBalance: number;
    goal: {
        name: string;
        required: number;
        collected: number;
    };
    categoryBreakdown: Array<{
        category: string;
        total: number;
    }>;
    monthlyTrend: Array<{
        label: string;
        total: number;
    }>;
    subscriptions: Expense[];
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface BillsStats {
    totalMonthly: number;
    upcomingCount: number;
    overdueCount: number;
    totalBills: number;
}

export interface BillsResponse {
    bills: Expense[];
    stats: BillsStats;
}
