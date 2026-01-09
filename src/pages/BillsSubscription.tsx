import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AddExpenseModal from '../components/AddExpenseModal';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';
import { billsAPI, expensesAPI } from '../services/api';
import type { Expense, BillsStats } from '../types';

const BillsSubscription: React.FC = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Expense[]>([]);
  const [stats, setStats] = useState<BillsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Expense | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'month' | 'year'>('all');

  const loadBills = async () => {
    try {

      // Don't set loading(true) here to avoid unmounting input on search
      // which causes focus loss

      let params: any = {};
      if (searchQuery) params.search = searchQuery;

      if (filterPeriod === 'month') {
        const now = new Date();
        params.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        params.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      } else if (filterPeriod === 'year') {
        const now = new Date();
        params.startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        params.endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
      }

      const data = await billsAPI.getAll(params);

      setBills(data.bills);
      setStats(data.stats);
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, [filterPeriod, searchQuery]);

  const handleSaveBill = async (expense: Partial<Expense>) => {
    if (selectedBill) {
      await expensesAPI.update(selectedBill.id, expense);
    } else {
      await expensesAPI.create({
        ...expense,
        category: 'Bill & Subscription'
      } as any);
    }
    await loadBills();
  };

  const handleEdit = (bill: Expense) => {
    setSelectedBill(bill);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setBillToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (billToDelete) {
      try {
        await expensesAPI.delete(billToDelete);
        await loadBills();
      } catch (error) {
        console.error('Error deleting bill:', error);
      }
    }
  };

  const getBillStatus = (date: string) => {
    const billDate = new Date(date);
    const now = new Date();
    const daysUntil = Math.ceil((billDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) return { label: 'Overdue', color: 'error', icon: AlertCircle };
    if (daysUntil <= 7) return { label: 'Due Soon', color: 'warning', icon: Clock };
    return { label: 'Active', color: 'success', icon: CheckCircle };
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <p>Loading bills...</p>
      </div>
    );
  }

  return (
    <div className="bills-page">
      <Sidebar />

      <main className="bills-main">
        <header className="bills-header">
          <div className="header-greeting">
            <h1>💳 Bills & Subscription</h1>
            <p>Manage all your recurring expenses and subscriptions</p>
          </div>

          <div className="header-actions">
            <div className="header-time">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} |{' '}
              {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} | IN
            </div>
            <button className="notification-btn">
              🔔
              <span className="notification-badge">2</span>
            </button>
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="bills-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card gradient-purple">
              <div className="stat-icon-wrapper">
                <TrendingUp size={32} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Monthly Bills</span>
                <div className="stat-amount">€{stats?.totalMonthly.toLocaleString() || '0'}</div>
                <div className="stat-footer">
                  <span className="stat-trend">+2.5% from last month</span>
                </div>
              </div>
            </div>

            <div className="stat-card gradient-blue">
              <div className="stat-icon-wrapper">
                <Calendar size={32} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Upcoming Bills</span>
                <div className="stat-amount">{stats?.upcomingCount || 0}</div>
                <div className="stat-footer">
                  <span className="stat-trend">Due in next 7 days</span>
                </div>
              </div>
            </div>

            <div className="stat-card gradient-orange">
              <div className="stat-icon-wrapper">
                <AlertCircle size={32} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Overdue Bills</span>
                <div className="stat-amount">{stats?.overdueCount || 0}</div>
                <div className="stat-footer">
                  <span className="stat-trend">Requires attention</span>
                </div>
              </div>
            </div>

            <div className="stat-card gradient-green">
              <div className="stat-icon-wrapper">
                <CheckCircle size={32} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Bills</span>
                <div className="stat-amount">{stats?.totalBills || 0}</div>
                <div className="stat-footer">
                  <span className="stat-trend">All subscriptions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="filter-bar">
            <div className="search-box-large">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search bills, subscriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-actions">
              <select
                className="period-select"
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as any)}
              >
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <button className="filter-btn">
                <Filter size={18} />
                <span>More Filters</span>
              </button>
            </div>
          </div>

          {/* Bills Grid */}
          <div className="bills-grid">
            {bills.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No Bills Found</h3>
                <p>Add your first bill or subscription to get started</p>
                <button className="btn-primary" onClick={() => { setSelectedBill(null); setIsModalOpen(true); }}>
                  <Plus size={20} />
                  <span>Add Bill</span>
                </button>
              </div>
            ) : (
              bills.map((bill) => {
                const Icon = (LucideIcons as any)[bill.icon] || LucideIcons.CreditCard;
                const status = getBillStatus(bill.date);
                const StatusIcon = status.icon;

                return (
                  <div key={bill.id} className="bill-card">
                    <div className="bill-header">
                      <div className="bill-icon">
                        <Icon size={28} />
                      </div>
                      <div className={`bill-status status-${status.color}`}>
                        <StatusIcon size={14} />
                        <span>{status.label}</span>
                      </div>
                    </div>

                    <div className="bill-body">
                      <h3 className="bill-name">{bill.sub_category || 'Unnamed Bill'}</h3>
                      <p className="bill-description">{bill.description || 'No description'}</p>

                      <div className="bill-details">
                        <div className="detail-item">
                          <span className="detail-label">Amount</span>
                          <span className="detail-value">€{bill.amount.toFixed(2)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Due Date</span>
                          <span className="detail-value">
                            {new Date(bill.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Payment Mode</span>
                          <span className="detail-value mode-badge">{bill.mode}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bill-footer">
                      <button className="btn-action" onClick={() => handleEdit(bill)}>Edit</button>
                      <button className="btn-action danger" onClick={() => handleDelete(bill.id)}>Delete</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <button className="fab" onClick={() => { setSelectedBill(null); setIsModalOpen(true); }}>
          <Plus size={24} />
        </button>
      </main>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedBill(null); }}
        onSubmit={handleSaveBill}
        expense={selectedBill}
        defaultCategory="Bill & Subscription"
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Bill"
        message="Are you sure you want to delete this bill? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />

      <style>{`
        .bills-page {
          display: flex;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .bills-main {
          flex: 1;
          margin-left: 260px;
          min-height: 100vh;
        }

        .bills-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-6);
          background-color: white;
          border-bottom: 1px solid var(--color-gray-200);
          box-shadow: var(--shadow-sm);
        }

        .header-greeting h1 {
          font-size: var(--font-size-2xl);
          margin-bottom: var(--space-1);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
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

        .bills-content {
          padding: var(--space-6);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-6);
          margin-bottom: var(--space-8);
        }

        .stat-card {
          background: white;
          border-radius: var(--radius-2xl);
          padding: var(--space-6);
          box-shadow: var(--shadow-lg);
          position: relative;
          overflow: hidden;
          display: flex;
          gap: var(--space-4);
          transition: all var(--transition-base);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
        }

        .stat-card.gradient-purple::before {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .stat-card.gradient-blue::before {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .stat-card.gradient-orange::before {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .stat-card.gradient-green::before {
          background: linear-gradient(135deg, #4facfe 0%, #43e97b 100%);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-2xl);
        }

        .stat-icon-wrapper {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .gradient-purple .stat-icon-wrapper {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .gradient-blue .stat-icon-wrapper {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }

        .gradient-orange .stat-icon-wrapper {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .gradient-green .stat-icon-wrapper {
          background: linear-gradient(135deg, #4facfe 0%, #43e97b 100%);
          color: white;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
          display: block;
          margin-bottom: var(--space-2);
        }

        .stat-amount {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-gray-900);
          margin-bottom: var(--space-2);
        }

        .stat-footer {
          display: flex;
          align-items: center;
        }

        .stat-trend {
          font-size: var(--font-size-xs);
          color: var(--color-gray-500);
        }

        .filter-bar {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
          align-items: center;
        }

        .search-box-large {
          flex: 1;
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-5);
          background-color: white;
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-sm);
        }

        .search-box-large input {
          border: none;
          background: none;
          outline: none;
          font-size: var(--font-size-base);
          width: 100%;
        }

        .filter-actions {
          display: flex;
          gap: var(--space-3);
        }

        .period-select {
          padding: var(--space-3) var(--space-4);
          border: 1px solid var(--color-gray-300);
          border-radius: var(--radius-lg);
          font-size: var(--font-size-sm);
          font-family: var(--font-family);
          cursor: pointer;
          background-color: white;
          box-shadow: var(--shadow-sm);
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-5);
          background-color: white;
          border: 1px solid var(--color-gray-300);
          border-radius: var(--radius-lg);
          font-size: var(--font-size-sm);
          font-family: var(--font-family);
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-fast);
        }

        .filter-btn:hover {
          background-color: var(--color-gray-50);
          border-color: var(--color-primary-500);
          color: var(--color-primary-600);
        }

        .bills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: var(--space-6);
        }

        .bill-card {
          background: white;
          border-radius: var(--radius-2xl);
          padding: var(--space-6);
          box-shadow: var(--shadow-md);
          transition: all var(--transition-base);
          border: 2px solid transparent;
        }

        .bill-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-2xl);
          border-color: var(--color-primary-200);
        }

        .bill-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-4);
        }

        .bill-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-xl);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bill-status {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
        }

        .status-success {
          background-color: #d1fae5;
          color: #065f46;
        }

        .status-warning {
          background-color: #fef3c7;
          color: #92400e;
        }

        .status-error {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .bill-body {
          margin-bottom: var(--space-5);
        }

        .bill-name {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          color: var(--color-gray-900);
          margin-bottom: var(--space-2);
        }

        .bill-description {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
          margin-bottom: var(--space-4);
        }

        .bill-details {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-2) 0;
          border-bottom: 1px solid var(--color-gray-100);
        }

        .detail-label {
          font-size: var(--font-size-xs);
          color: var(--color-gray-500);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-gray-900);
        }

        .mode-badge {
          padding: var(--space-1) var(--space-2);
          background-color: var(--color-gray-100);
          border-radius: var(--radius-md);
          font-size: var(--font-size-xs);
        }

        .bill-footer {
          display: flex;
          gap: var(--space-3);
          margin-top: var(--space-5);
        }

        .btn-action {
          flex: 1;
          padding: var(--space-2) var(--space-4);
          border: 1px solid var(--color-gray-300);
          border-radius: var(--radius-lg);
          font-size: var(--font-size-sm);
          font-family: var(--font-family);
          cursor: pointer;
          background-color: white;
          color: var(--color-gray-700);
          transition: all var(--transition-fast);
        }

        .btn-action:hover {
          background-color: var(--color-gray-50);
          border-color: var(--color-primary-500);
          color: var(--color-primary-600);
        }

        .btn-action.danger:hover {
          background-color: #fee2e2;
          border-color: var(--color-error);
          color: var(--color-error);
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: var(--space-16);
        }

        .empty-icon {
          font-size: 80px;
          margin-bottom: var(--space-4);
        }

        .empty-state h3 {
          font-size: var(--font-size-xl);
          color: var(--color-gray-900);
          margin-bottom: var(--space-2);
        }

        .empty-state p {
          font-size: var(--font-size-base);
          color: var(--color-gray-600);
          margin-bottom: var(--space-6);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-6);
          background: linear-gradient(135deg, var(--color-primary-600), var(--color-blue-500));
          color: white;
          border: none;
          border-radius: var(--radius-lg);
          font-size: var(--font-size-base);
          font-family: var(--font-family);
          font-weight: var(--font-weight-semibold);
          cursor: pointer;
          box-shadow: var(--shadow-lg);
          transition: all var(--transition-base);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-2xl);
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

          .bills-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }
        }

        @media (max-width: 1024px) {
          .bills-main {
            margin-left: 0;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filter-bar {
            flex-direction: column;
          }

          .search-box-large {
            width: 100%;
          }

          .filter-actions {
            width: 100%;
          }

          .period-select, .filter-btn {
            flex: 1;
          }
        }

        @media (max-width: 768px) {
          .bills-grid {
            grid-template-columns: 1fr;
          }

          .header-time {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default BillsSubscription;
