import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useLanguage } from '../../context/LanguageContext';

interface MonthlyChartProps {
    data: Array<{ label: string; total: number }>;
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ data }) => {
    const { t, language } = useLanguage();

    // Map our custom language codes to standard BCP 47 locale codes
    const getLocaleCode = (langCode: string): string => {
        const localeMap: Record<string, string> = {
            'kg': 'ky-KG', // Kyrgyz
            'kz': 'kk-KZ', // Kazakh
            'tj': 'tg-TJ', // Tajik
            'uz': 'uz-UZ', // Uzbek
        };
        return localeMap[langCode] || langCode;
    };

    const formatMonth = (label: string) => {
        try {
            const date = new Date(`${label} 1, 2024`);
            if (isNaN(date.getTime())) return label;
            const locale = getLocaleCode(language);
            return new Intl.DateTimeFormat(locale, { month: 'short' }).format(date);
        } catch {
            return label;
        }
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => formatMonth(value)}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `€${value / 1000}k`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: number) => [`€${value.toFixed(2)}`, t.expenses.amount]}
                    labelFormatter={(label) => formatMonth(label)}
                    labelStyle={{ color: '#111827', fontWeight: 600 }}
                />
                <Bar
                    dataKey="total"
                    fill="url(#colorGradient)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                />
                <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                    </linearGradient>
                </defs>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default MonthlyChart;
