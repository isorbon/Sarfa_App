import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import { formatMonthName } from '../../utils/dateFormatter';

interface MonthlyChartProps {
    data: Array<{ label: string; total: number }>;
}

const monthIndexMap: Record<string, number> = {
    // English
    'January': 0, 'Jan': 0,
    'February': 1, 'Feb': 1,
    'March': 2, 'Mar': 2,
    'April': 3, 'Apr': 3,
    'May': 4,
    'June': 5, 'Jun': 5,
    'July': 6, 'Jul': 6,
    'August': 7, 'Aug': 7,
    'September': 8, 'Sep': 8,
    'October': 9, 'Oct': 9,
    'November': 10, 'Nov': 10,
    'December': 11, 'Dec': 11,
    // German
    'Januar': 0, 'Jän': 0,
    'März': 2, 'Mär': 2,
    'Mai': 4,
    'Juni': 5,
    'Juli': 6,
    'Oktober': 9, 'Okt': 9,
    'Dezember': 11, 'Dez': 11,
    // Spanish
    'Enero': 0, 'Ene': 0,
    'Febrero': 1,
    'Marzo': 2,
    'Abril': 3, 'Abr': 3,
    'Mayo': 4,
    'Junio': 5,
    'Julio': 6,
    'Agosto': 7, 'Ago': 7,
    'Septiembre': 8, 'Sept': 8,
    'Octubre': 9,
    'Noviembre': 10,
    'Diciembre': 11, 'Dic': 11,
    // French
    'Janvier': 0, 'Janv': 0,
    'Février': 1, 'Févr': 1,
    'Mars': 2,
    'Avril': 3, 'Avr': 3,
    'Juin': 5,
    'Juillet': 6, 'Juil': 6,
    'Août': 7,
    'Octobre': 9,
    'Décembre': 11, 'Déc': 11,
};

const MonthlyChart: React.FC<MonthlyChartProps> = ({ data }) => {
    const { language, t } = useLanguage();
    const { theme } = useTheme();
    const { formatPrice, getCurrencySymbol } = useCurrency();
    const isDark = theme === 'dark';

    const formatMonth = (label: string) => {
        // Try to parse English month name
        const idx = monthIndexMap[label];

        if (idx !== undefined) {
            const d = new Date(2023, idx, 1);
            // Return localized short name using robust helper (supports tj, kg, etc.)
            return formatMonthName(d, language, 'short');
        }

        // Return original if not found
        return label;
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
                    tickFormatter={(value) => `${getCurrencySymbol()}${value / 1000}k`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    itemStyle={{ color: isDark ? '#f9fafb' : '#111827' }}
                    formatter={(value: number) => [formatPrice(value), t.expenses.amount]}
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
