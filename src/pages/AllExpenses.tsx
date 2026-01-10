import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Sidebar from '../components/Sidebar';
import AddExpenseModal from '../components/AddExpenseModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useCurrency } from '../context/CurrencyContext';
import { expensesAPI } from '../services/api';
import type { Expense } from '../types';
import UserMenu from '../components/UserMenu';

const AllExpenses: React.FC = () => {
  const { formatPrice } = useCurrency();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  // ...

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expensesAPI.getAll();
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleAddExpense = async (expense: Partial<Expense>) => {
    if (editingExpense) {
      await expensesAPI.update(editingExpense.id, expense);
    } else {
      await expensesAPI.create(expense as any);
    }
    await loadExpenses();
    setEditingExpense(null);
  };

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (expenseToDelete) {
      await expensesAPI.delete(expenseToDelete.id);
      await loadExpenses();
      setIsDeleteModalOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch =
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.sub_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || expense.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categories = ['All', ...Array.from(new Set(expenses.map(e => e.category)))];

  return (
    <div className="all-expenses">
      <Sidebar />

      <main className="expenses-main">
        <header className="expenses-header">
          <div className="header-greeting">
            <h1>All Expenses</h1>
            <p>Manage and track all your expenses</p>
          </div>
          <div className="header-actions">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <div className="expenses-content">
          <div className="expenses-controls">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="expenses-summary">
            <div className="summary-item">
              <span className="summary-label">Total Expenses:</span>
              <span className="summary-value">{formatPrice(totalAmount)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Count:</span>
              <span className="summary-value">{filteredExpenses.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Loading expenses...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="empty-state">
              <p>No expenses found</p>
            </div>
          ) : (
            <div className="expenses-table-container">
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Icon</th>
                    <th>Category</th>
                    <th>Sub Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => {
                    const Icon = (LucideIcons as any)[expense.icon] || LucideIcons.ShoppingCart;
                    return (
                      <tr key={expense.id}>
                        <td>{new Date(expense.date).toLocaleDateString('en-GB')}</td>
                        <td>
                          <div className="expense-icon">
                            <Icon size={20} />
                          </div>
                        </td>
                        <td><span className="category-badge">{expense.category}</span></td>
                        <td>{expense.sub_category || '-'}</td>
                        <td>{expense.description || '-'}</td>
                        <td className="amount">{formatPrice(expense.amount)}</td>
                        <td><span className="mode-badge">{expense.mode}</span></td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon edit"
                              onClick={() => handleEdit(expense)}
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn-icon delete"
                              onClick={() => handleDeleteClick(expense)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        className="fab"
        onClick={() => setIsModalOpen(true)}
        title="Add Expense"
      >
        <Plus size={24} />
      </button>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleAddExpense}
        expense={editingExpense}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setExpenseToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Expense"
        message={`Are you sure you want to delete ${expenseToDelete?.description || 'this expense'}? This process cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

      <style>{`
        .all-expenses {
          display: flex;
          min-height: 100vh;
          background-color: var(--color-bg-primary);
        }

        .expenses-main {
          flex: 1;
          margin-left: 260px;
          min-height: 100vh;
        }

        .expenses-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-6);
          background-color: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-gray-200);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .expenses-header h1 {
          font-size: var(--font-size-2xl);
          margin-bottom: var(--space-1);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .expenses-header p {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
          margin: 0;
        }

        .expenses-content {
          padding: var(--space-6);
        }

        .expenses-controls {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          background-color: var(--color-bg-secondary);
          border: 1px solid var(--color-gray-300);
          border-radius: var(--radius-md);
        }

        .search-box input {
          border: none;
          background: none;
          outline: none;
          font-size: var(--font-size-sm);
          width: 100%;
          font-family: var(--font-family);
          color: var(--color-text-primary);
        }

        .category-filter {
          padding: var(--space-3) var(--space-4);
          border: 1px solid var(--color-gray-300);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          font-family: var(--font-family);
          background-color: var(--color-bg-secondary);
          color: var(--color-text-primary);
          cursor: pointer;
          min-width: 200px;
        }

        .expenses-summary {
          display: flex;
          gap: var(--space-6);
          padding: var(--space-6);
          background-color: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          margin-bottom: var(--space-6);
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .summary-label {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
        }

        .summary-value {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-gray-900);
        }

        .expenses-table-container {
          background-color: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }

        .expenses-table {
          width: 100%;
          border-collapse: collapse;
        }

        .expenses-table th {
          text-align: left;
          padding: var(--space-4);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          color: var(--color-gray-600);
          text-transform: uppercase;
          background-color: var(--color-gray-50);
          border-bottom: 1px solid var(--color-gray-200);
        }

        .expenses-table td {
          padding: var(--space-4);
          font-size: var(--font-size-sm);
          color: var(--color-gray-700);
          border-bottom: 1px solid var(--color-gray-100);
        }

        .expenses-table tbody tr:hover {
          background-color: var(--color-gray-50);
        }

        .expense-icon {
          width: 36px;
          height: 36px;
          background-color: var(--color-primary-100);
          color: var(--color-primary-600);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .category-badge {
          padding: var(--space-2) var(--space-3);
          background-color: var(--color-primary-100);
          color: var(--color-primary-700);
          border-radius: var(--radius-md);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
        }

        .mode-badge {
          padding: var(--space-1) var(--space-3);
          background-color: var(--color-gray-100);
          border-radius: var(--radius-md);
          font-size: var(--font-size-xs);
        }

        .amount {
          font-weight: var(--font-weight-semibold);
          color: var(--color-gray-900);
        }

        .action-buttons {
          display: flex;
          gap: var(--space-2);
        }

        .btn-icon {
          background: none;
          border: none;
          padding: var(--space-2);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-icon.edit {
          color: var(--color-primary-600);
        }

        .btn-icon.edit:hover {
          background-color: var(--color-primary-100);
        }

        .btn-icon.delete {
          color: var(--color-error);
        }

        .btn-icon.delete:hover {
          background-color: #fee2e2;
        }

        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-16);
          background-color: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
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

        @media (max-width: 1024px) {
          .expenses-main {
            margin-left: 0;
          }
        }

        @media (max-width: 768px) {
          .expenses-controls {
            flex-direction: column;
          }

          .category-filter {
            min-width: 100%;
          }

          .expenses-table-container {
            overflow-x: auto;
          }

          .expenses-table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  );
};

export default AllExpenses;
