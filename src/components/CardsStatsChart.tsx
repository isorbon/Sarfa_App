import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '../context/LanguageContext';

interface CardStat {
    card_id: number;
    card_name: string;
    month: string;
    total_amount: number;
}

interface Props {
    data: CardStat[];
}

const CardsStatsChart: React.FC<Props> = ({ data }) => {
    const { t } = useLanguage();
    const chartData = useMemo(() => {
        const grouped = data.reduce((acc, curr) => {
            if (!acc[curr.month]) {
                acc[curr.month] = { month: curr.month };
            }
            acc[curr.month][curr.card_name] = curr.total_amount;
            return acc;
        }, {} as Record<string, any>);

        return Object.values(grouped).sort((a, b) => a.month.localeCompare(b.month));
    }, [data]);

    const cards = Array.from(new Set(data.map(d => d.card_name)));
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'];

    if (!data || data.length === 0) {
        return (
            <div className="cards-chart-container" style={{
                textAlign: 'center',
                padding: 'var(--space-8)',
                backgroundColor: 'var(--color-bg-secondary)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-border)',
                marginBottom: 'var(--space-6)'
            }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>{t.cards.expensesByCard}</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>No card expenses found. Add transactions to your cards to see trends.</p>
            </div>
        );
    }

    return (
        <div className="cards-chart-container">
            <h3 className="cards-chart-title">{t.cards.expensesByCard}</h3>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `€${value}`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px'
                            }}
                        />
                        {cards.map((card, index) => (
                            <Line
                                key={card}
                                type="monotone"
                                dataKey={card}
                                stroke={colors[index % colors.length]}
                                strokeWidth={3}
                                dot={{ r: 4, strokeWidth: 2, fill: 'var(--color-bg-secondary)' }}
                                activeDot={{ r: 6 }}
                                connectNulls
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="custom-legend">
                {cards.map((card, index) => (
                    <div key={card} className="legend-item">
                        <span
                            className="legend-dot"
                            style={{ color: colors[index % colors.length] }}
                        >
                            -o-
                        </span>
                        <span style={{ color: colors[index % colors.length] }}>
                            {card}
                        </span>
                    </div>
                ))}
            </div>

            <style>{`
                .cards-chart-title {
                    margin-bottom: 1rem;
                    color: var(--color-text-primary);
                }

                .cards-chart-container {
                    background-color: var(--color-bg-secondary);
                    border-radius: var(--radius-xl);
                    padding: var(--space-6);
                    margin-bottom: var(--space-6);
                    border: 1px solid var(--color-border);
                }
                
                .chart-wrapper {
                    width: 100%;
                    height: 300px;
                }

                .custom-legend {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: var(--space-4);
                    margin-top: var(--space-2);
                }
                
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    font-size: var(--font-size-sm);
                    font-weight: 500;
                }

                .legend-dot {
                    font-weight: bold;
                }
                
                @media (max-width: 768px) {
                    .cards-chart-title {
                        font-size: 1.25rem;
                        margin-bottom: 1.5rem;
                    }

                    .cards-chart-container {
                        padding: var(--space-4);
                        margin-left: -8px;
                    }
                    
                    .chart-wrapper {
                        margin-right: 0;
                        height: 180px;
                    }
                }
            `}</style>
        </div>
    );
};

export default CardsStatsChart;
