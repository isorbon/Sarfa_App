import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import { useLanguage } from '../../context/LanguageContext';

interface CategoryChartProps {
    data: Array<{ category: string; total: number }>;
}

const COLORS: Record<string, string> = {
    'Food & Grocery': '#10b981',
    'Investment': '#8b5cf6',
    'Shopping': '#f59e0b',
    'Travelling': '#3b82f6',
    'Miscellaneous': '#f97316',
    'Bill & Subscription': '#06b6d4',
};

const categoryKeyMap: Record<string, keyof import('../../locales/types').Translation['filters']> = {
    'Food & Grocery': 'foodGrocery',
    'Investment': 'investment',
    'Shopping': 'shopping',
    'Travelling': 'travelling',
    'Miscellaneous': 'miscellaneous',
    'Bill & Subscription': 'bills',
};

import { useTheme } from '../../context/ThemeContext';

const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
    const { t } = useLanguage();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const chartData = data.map(item => ({
        name: t.filters[categoryKeyMap[item.category]] || item.category,
        value: item.total,
        color: COLORS[item.category] || '#6b7280',
    }));

    return (
        <div className="category-chart-container">
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: isDark ? '#1e293b' : '#ffffff',
                            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                        itemStyle={{ color: isDark ? '#f9fafb' : '#111827' }}
                        formatter={(value: number) => `€${value.toFixed(2)}`}
                    />
                </PieChart>
            </ResponsiveContainer>

            <div className="category-legend">
                {chartData.map((item, index) => (
                    <div key={index} className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: item.color }} />
                        <span className="legend-label">{item.name}</span>
                        <span className="legend-value">€{item.value.toFixed(2)}</span>
                    </div>
                ))}
            </div>

            <style>{`
        .category-chart-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .category-legend {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--font-size-sm);
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: var(--radius-sm);
          flex-shrink: 0;
        }

        .legend-label {
          flex: 1;
          color: var(--color-gray-700);
        }

        .legend-value {
          font-weight: var(--font-weight-semibold);
          color: var(--color-gray-900);
        }
      `}</style>
        </div>
    );
};

export default CategoryChart;
