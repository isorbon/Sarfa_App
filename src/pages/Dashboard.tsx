import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, TrendingUp, TrendingDown, Wallet, BarChart3 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Layout from '../components/Layout';
import AddExpenseModal from '../components/AddExpenseModal';
import MonthlyChart from '../components/Charts/MonthlyChart';
import CategoryChart from '../components/Charts/CategoryChart';
import { dashboardAPI, expensesAPI } from '../services/api';
import type { DashboardStats, Expense } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import UserMenu from '../components/UserMenu';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthlyPeriod, setMonthlyPeriod] = useState<'3months' | '6months' | 'year' | 'month' | 'lastYear'>('3months');
  const [categoryPeriod, setCategoryPeriod] = useState<'3months' | '6months' | 'year' | 'month' | 'lastYear'>('3months');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  const nextGoal = () => {
    if (stats?.goals && stats.goals.length > 0) {
      setSlideDirection('right');
      setCurrentGoalIndex((prev) => (prev + 1) % stats.goals.length);
    }
  };

  const prevGoal = () => {
    if (stats?.goals && stats.goals.length > 0) {
      setSlideDirection('left');
      setCurrentGoalIndex((prev) => (prev - 1 + stats.goals.length) % stats.goals.length);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboardData, expenses] = await Promise.all([
        dashboardAPI.getStats(monthlyPeriod, categoryPeriod),
        expensesAPI.getAll({ startDate: '', endDate: '' })
      ]);
      setStats(dashboardData);
      setRecentExpenses(expenses);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [monthlyPeriod, categoryPeriod]);

  const handleAddExpense = async (expense: Partial<Expense>) => {
    await expensesAPI.create(expense as any);
    await loadData();
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <p>{t.common.loading}</p>
      </div>
    );
  }

  return (
    <Layout>
      <main className="dashboard-main">
        <header className="dashboard-header desktop-header">
          <div className="header-greeting">
            <h1>
              <span className="gradient-text">{t.common.welcomeBack}, {user?.name?.split(' ')[0] || 'User'}</span>{' '}
              <span className="emoji">👋</span>
            </h1>
            <p>{t.dashboard.subtitle}</p>
            {/* Using a makeshift translation for now or fixed text if not in dictionary exactly */}
            {/* actually I should update the dictionary or just use a placeholder for subtitle as I didn't add it specifically */}
            {/* Let's stick closer to existing text or use what I have. t.common.expensesList might not fit exactly. */}
            {/* I will use a hardcoded fallback or better, add 'dashboardSubtitle' to dictionary later. For now, I'll keep English hardcoded if no perfect key, or use a generic one. */}
            {/* Actually, let's use t.common.dashboard for now to show it works, or just keep it English for the subtitle that I missed in step 1. */}
            {/* I'll add 'dashboardSubtitle' to types briefly if I can, but I already wrote the file. */}
            {/* I'll specificially focus on the "LanguageSwitcher" placement as requested first. */}
          </div>

          <div className="header-actions">
            <LanguageSwitcher />
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <div className="dashboard-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper icon-wrapper-orange">
                  <Wallet size={24} />
                </div>
                <h3 className="stat-title">{t.common.totalBalance}</h3>
                <div className="stat-badge success">
                  <TrendingUp size={14} />
                  <span>{formatPrice(186)}</span>
                </div>
              </div>
              <div className="stat-amount">{formatPrice(stats?.accountBalance || 0)}</div>
              <div className="stat-trend positive">
                <span>+2.5%</span>
                <span className="text-gray">{t.dashboard.vsLastMonth}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper icon-wrapper-blue">
                  <BarChart3 size={24} />
                </div>
                <h3 className="stat-title">{t.common.monthlyExpenses}</h3>
                <div className="stat-badge error">
                  <TrendingDown size={14} />
                  <span>{formatPrice(2000)}</span>
                </div>
              </div>
              <div className="stat-amount">{formatPrice(stats?.monthlyExpenses || 0)}</div>
              <div className="stat-trend error">
                <span>-4%</span>
                <span className="text-gray">{t.dashboard.vsLastMonth}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper icon-wrapper-purple">
                  <TrendingUp size={24} />
                </div>
                <h3 className="stat-title">{t.dashboard.totalInvestment}</h3>
              </div>
              <div className="stat-amount">{formatPrice(stats?.totalInvestment || 0)}</div>
              <div className="stat-chart">
                <svg viewBox="0 0 100 30" style={{ width: '100%', height: '60px' }}>
                  <path
                    d="M 0 25 Q 25 20 50 15 T 100 5"
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="2"
                  />
                  <defs>
                    <linearGradient id="lineGradient">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="stat-trend positive">
                <TrendingUp size={14} />
                <span>{t.dashboard.investAmount} {formatPrice(100000)}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <div className="stat-icon-wrapper icon-wrapper-orange">
                    <span className="stat-icon">🎯</span>
                  </div>
                  <h3 className="stat-title">{t.common.goals}</h3>
                </div>
                {stats?.goals && stats.goals.length > 1 && (
                  <div className="goal-controls">
                    <button onClick={prevGoal} className="goal-arrow-btn">
                      <LucideIcons.ChevronLeft size={16} />
                    </button>
                    <button onClick={nextGoal} className="goal-arrow-btn">
                      <LucideIcons.ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div className="goal-content">
                {stats?.goals && stats.goals.length > 0 ? (
                  <div
                    key={currentGoalIndex}
                    className={`goal-animated-wrapper ${slideDirection === 'right' ? 'slide-in-right' : 'slide-in-left'}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', width: '100%' }}
                  >
                    <div className="goal-circle">
                      <svg viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="url(#goalGradient)"
                          strokeWidth="8"
                          strokeDasharray={`${(stats.goals[currentGoalIndex].collected || 0) / (stats.goals[currentGoalIndex].required || 1) * 314} 314`}
                          strokeLinecap="round"
                          transform="rotate(-90 60 60)"
                        />
                        <defs>
                          <linearGradient id="goalGradient">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#f97316" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="goal-info">
                      <div className="goal-name">{stats.goals[currentGoalIndex].name}</div>
                      <div className="goal-required">{t.dashboard.required} {formatPrice(stats.goals[currentGoalIndex].required || 0)}</div>
                      <div className="goal-collected">{t.dashboard.collected} {formatPrice(stats.goals[currentGoalIndex].collected || 0)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="goal-info">
                    <div className="goal-name">{t.goals?.noGoals || 'No Goal Set'}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-grid">
            <div className="chart-card">
              <div className="card-header">
                <div className="card-title">
                  <span className="card-icon">📊</span>
                  <span>{t.common.monthlyExpenses}</span>
                </div>
                <div className="card-actions">
                  <span className="trend-badge positive">6% {t.dashboard.moreThanLastMonth}</span>
                  <select
                    className="period-select"
                    value={monthlyPeriod}
                    onChange={(e) => setMonthlyPeriod(e.target.value as any)}
                  >
                    <option value="3months">{t.dashboard.periods.m3}</option>
                    <option value="6months">{t.dashboard.periods.m6}</option>
                    <option value="month">{t.dashboard.periods.month}</option>
                    <option value="year">{t.dashboard.periods.year}</option>
                    <option value="lastYear">{t.dashboard.periods.lastYear}</option>
                  </select>
                </div>
              </div>
              <MonthlyChart data={stats?.monthlyTrend || []} />
            </div>

            <div className="chart-card">
              <div className="card-header">
                <div className="card-title">
                  <span className="card-icon">🥧</span>
                  <span>{t.dashboard.topCategory}</span>
                </div>
                <select
                  className="period-select"
                  value={categoryPeriod}
                  onChange={(e) => setCategoryPeriod(e.target.value as any)}
                >
                  <option value="3months">{t.dashboard.periods.m3}</option>
                  <option value="6months">{t.dashboard.periods.m6}</option>
                  <option value="month">{t.dashboard.periods.month}</option>
                  <option value="year">{t.dashboard.periods.year}</option>
                  <option value="lastYear">{t.dashboard.periods.lastYear}</option>
                </select>
              </div>
              <CategoryChart data={stats?.categoryBreakdown || []} />
            </div>
          </div>

          {/* Recent Expenses & Subscriptions */}
          <div className="bottom-grid">
            <div className="expenses-card">
              <div className="card-header">
                <div className="card-title">
                  <span className="card-icon">📋</span>
                  <span>{t.common.expensesList}</span>
                </div>
                <div className="card-actions">
                  <button className="btn-icon"><Filter size={18} /></button>
                  <select className="period-select">
                    <option>{t.filters.recent}</option>
                  </select>
                </div>
              </div>

              <div className="expenses-table">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{t.expenses.amount}</th>
                      <th>{t.expenses.category}</th>
                      <th>{t.expenses.subCategory}</th>
                      <th>{t.expenses.date}</th>
                      <th>{t.expenses.mode}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExpenses.map((expense, index) => {

                      return (
                        <tr key={expense.id}>
                          <td>{index + 1}.</td>
                          <td className="amount">{formatPrice(expense.amount)}</td>
                          <td>{expense.category}</td>
                          <td>{expense.sub_category || '-'}</td>
                          <td>{new Date(expense.date).toLocaleDateString('en-GB')}</td>
                          <td><span className="mode-badge">{expense.mode}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="subscription-card">
              <div className="card-header">
                <div className="card-title">
                  <span className="card-icon">💳</span>
                  <span>{t.common.billsSubscription}</span>
                </div>
                <Link to="/bills">
                  <button className="btn-text">{t.dashboard.viewDetails}</button>
                </Link>
              </div>

              <div className="subscription-list">
                {stats?.subscriptions.map((sub) => {
                  const Icon = (LucideIcons as any)[sub.icon] || LucideIcons.CreditCard;
                  return (
                    <div key={sub.id} className="subscription-item">
                      <div className="subscription-icon">
                        <Icon size={24} />
                      </div>
                      <div className="subscription-info">
                        <div className="subscription-name">{sub.sub_category}</div>
                        <div className="subscription-date">{new Date(sub.date).toLocaleDateString('en-GB')}</div>
                      </div>
                      <div className="subscription-amount">{formatPrice(sub.amount)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <button className="fab" onClick={() => setIsModalOpen(true)} title={t.common.addExpense}>
          <Plus size={24} />
        </button>
      </main>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddExpense}
      />

      <style>{`
        .dashboard {
          display: flex;
          min-height: 100vh;
          background-color: var(--color-bg-primary);
        }

        .dashboard-main {
          flex: 1;
          /* margin-left removed */
          min-height: 100vh;
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-6);
          background-color: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-gray-200);
        }

        .header-greeting h1 {
          font-size: var(--font-size-2xl);
          margin-bottom: var(--space-1);
        }

        .header-greeting h1 .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-greeting h1 .emoji {
          display: inline-block;
        }

        .header-greeting p {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .header-time {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          background-color: var(--color-gray-100);
          border-radius: var(--radius-lg);
          min-width: 300px;
        }

        .search-box input {
          border: none;
          background: none;
          outline: none;
          font-size: var(--font-size-sm);
          width: 100%;
        }

        .notification-btn {
          position: relative;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background-color: var(--color-error);
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: var(--radius-full);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--color-primary-600), var(--color-blue-500));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: var(--font-weight-bold);
        }

        .dashboard-content {
          padding: var(--space-6);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-6);
          margin-bottom: var(--space-6);
        }

        .stat-card {
          background-color: var(--color-bg-secondary);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          box-shadow: var(--shadow-sm);
          position: relative;
          overflow: hidden;
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
        }

        .stat-title {
          font-size: var(--font-size-md);
          font-weight: var(--font-weight-medium);
          color: var(--color-gray-700);
          margin: 0;
        }

        .stat-icon {
          font-size: 24px;
        }

        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
        }

        .stat-amount {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-gray-900);
          margin-bottom: var(--space-2);
          margin-top: var(--space-12);
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--font-size-xs);
          margin-top: var(--space-3);
        }

        .stat-trend.positive {
          color: var(--color-success);
        }

        .stat-trend.negative {
          color: var(--color-error);
        }

        .stat-badge {
          position: absolute;
          top: var(--space-4);
          right: var(--space-4);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
        }

        .stat-badge.success {
          background-color: #d1fae5;
          color: #065f46;
        }

        .stat-badge.error {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .stat-chart {
          margin: var(--space-4) 0;
        }

        .goal-content {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          margin-top: var(--space-8);
        }

        .goal-circle {
          width: 120px;
          height: 120px;
          flex-shrink: 0;
        }

        .goal-info {
          flex: 1;
        }

        .goal-name {
          font-weight: var(--font-weight-semibold);
          color: var(--color-gray-900);
          margin-bottom: var(--space-2);
          font-size: var(--font-size-xl);
        }

        .goal-required {
          font-size: var(--font-size-sm);
          color: var(--color-gray-500);
        }

        .goal-collected {
          font-size: var(--font-size-sm);
          color: var(--color-success);
        }

        .goal-controls {
            display: flex;
            gap: 4px;
        }

        .goal-arrow-btn {
            background: var(--color-bg-primary); 
            border: 1px solid var(--color-border);
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: var(--color-text-secondary);
            padding: 0;
        }
        
        .goal-arrow-btn:hover {
            border-color: var(--color-primary-600);
            color: var(--color-primary-600);
        }

        .goal-animated-wrapper {
            animation-duration: 0.3s;
            animation-fill-mode: both;
            animation-timing-function: ease-out;
        }

        .slide-in-right {
            animation-name: slideInRight;
        }

        .slide-in-left {
            animation-name: slideInLeft;
        }

        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: var(--space-6);
          margin-bottom: var(--space-6);
        }

        .chart-card {
          background-color: var(--color-bg-secondary);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          box-shadow: var(--shadow-sm);
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-6);
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-weight: var(--font-weight-semibold);
          color: var(--color-gray-900);
        }

        .card-icon {
          font-size: 20px;
        }

        .card-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .trend-badge {
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
        }

        .trend-badge.positive {
          background-color: #d1fae5;
          color: #065f46;
        }

        .period-select {
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--color-gray-300);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          font-family: var(--font-family);
          cursor: pointer;
        }

        .bottom-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: var(--space-6);
        }

        .expenses-card, .subscription-card {
          background-color: var(--color-bg-secondary);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          box-shadow: var(--shadow-sm);
        }

        .btn-icon {
          background: none;
          border: none;
          padding: var(--space-2);
          border-radius: var(--radius-md);
          cursor: pointer;
          color: var(--color-gray-600);
        }

        .btn-icon:hover {
          background-color: var(--color-gray-100);
        }

        .btn-text {
          background: none;
          border: none;
          color: var(--color-primary-600);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          cursor: pointer;
        }

        .expenses-table {
          overflow-x: auto;
          max-height: 400px;
          overflow-y: auto;
        }

        .expenses-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .expenses-table th {
          position: sticky;
          top: 0;
          z-index: 1;
          text-align: left;
          padding: var(--space-3);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          color: var(--color-gray-600);
          text-transform: uppercase;
          background-color: var(--color-gray-50);
          border-bottom: 1px solid var(--color-gray-200);
        }

        .expenses-table td {
          padding: var(--space-4) var(--space-3);
          font-size: var(--font-size-sm);
          color: var(--color-gray-700);
          border-bottom: 1px solid var(--color-gray-100);
        }

        .expenses-table td.amount {
          font-weight: var(--font-weight-semibold);
          color: var(--color-gray-900);
        }

        .mode-badge {
          padding: var(--space-1) var(--space-3);
          background-color: var(--color-gray-100);
          border-radius: var(--radius-md);
          font-size: var(--font-size-xs);
        }

        .subscription-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          max-height: 400px;
          overflow-y: auto;
        }

        .subscription-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background-color: var(--color-gray-50);
          border-radius: var(--radius-lg);
        }

        .subscription-icon {
          width: 48px;
          height: 48px;
          background-color: white;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary-600);
        }

        .subscription-info {
          flex: 1;
        }

        .subscription-name {
          font-weight: var(--font-weight-semibold);
          color: var(--color-gray-900);
          margin-bottom: var(--space-1);
        }

        .subscription-date {
          font-size: var(--font-size-xs);
          color: var(--color-gray-500);
        }

        .subscription-amount {
          font-weight: var(--font-weight-bold);
          color: var(--color-gray-900);
        }

        .fab {
          position: fixed;
          bottom: var(--space-8);
          right: var(--space-8);
          width: 60px;
          height: 60px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--color-primary-600), var(--color-blue-500));
          color: white;
          border: none;
          box-shadow: var(--shadow-2xl);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform var(--transition-base);
        }

        .fab:hover {
          transform: scale(1.1);
        }

        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: var(--space-4);
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid var(--color-gray-200);
          border-top-color: var(--color-primary-600);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1400px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .dashboard-main {
            margin-left: 0;
          }

          .charts-grid,
          .bottom-grid {
            grid-template-columns: 1fr;
          }

          .search-box {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .dashboard-content {
            padding: var(--space-4);
            width: 100%;
            max-width: 100vw;
            box-sizing: border-box;
            overflow-x: hidden;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            width: 100%;
          }

          .charts-grid, 
          .bottom-grid {
            grid-template-columns: 1fr;
            width: 100%;
            gap: var(--space-4);
          }
          
          /* Crucial: layout constraints */
          .dashboard-card {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            box-sizing: border-box;
            margin: 0;
            overflow: hidden; /* Contain children */
          }

          .card-content {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          /* Force table to scroll inside */
          .recent-expenses-table {
            min-width: 600px;
            width: 100%;
            display: table;
          }

          /* Hide elements */
          .header-time,
          .desktop-header {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Dashboard;
