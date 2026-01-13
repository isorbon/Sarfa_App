import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface MonthlyChartProps {
    data: Array<{ label: string; total: number }>;
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ data }) => {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const formatMonth = (label: string) => {
        const monthMap: Record<string, keyof typeof t.months.short> = {
            // Full month names
            'January': 'jan',
            'February': 'feb',
            'March': 'mar',
            'April': 'apr',
            'May': 'may',
            'June': 'jun',
            'July': 'jul',
            'August': 'aug',
            'September': 'sep',
            'October': 'oct',
            'November': 'nov',
            'December': 'dec',
            // Abbreviated month names
            'Jan': 'jan',
            'Feb': 'feb',
            'Mar': 'mar',
            'Apr': 'apr',
            'Jun': 'jun',
            'Jul': 'jul',
            'Aug': 'aug',
            'Sep': 'sep',
            'Oct': 'oct',
            'Nov': 'nov',
            'Dec': 'dec',
        };

        const monthKey = monthMap[label];
        return monthKey ? t.months.short[monthKey] : label;
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} vertical={false} />
                <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => formatMonth(value)}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDark ? '#9ca3af' : '#6b7280', fontSize: 12 }}
                    tickFormatter={(value) => `€${value / 1000}k`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    itemStyle={{ color: isDark ? '#f9fafb' : '#111827' }}
                    formatter={(value: number) => [`€${value.toFixed(2)}`, t.expenses.amount]}
                    labelFormatter={(label) => formatMonth(label)}
                    labelStyle={{ color: isDark ? '#f9fafb' : '#111827', fontWeight: 600 }}
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
