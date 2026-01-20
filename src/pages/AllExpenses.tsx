import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, FileText, FileType } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import Layout from '../components/Layout';
import AddExpenseModal from '../components/AddExpenseModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { useCurrency } from '../context/CurrencyContext';
import { expensesAPI } from '../services/api';
import type { Expense } from '../types';
import UserMenu from '../components/UserMenu';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import { formatDateForDisplay } from '../utils/dateFormatter';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

const AllExpenses: React.FC = () => {
  const { t, language } = useLanguage();
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

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      'All': t.filters.all,
      'Food & Grocery': t.filters.foodGrocery,
      'Investment': t.filters.investment,
      'Shopping': t.filters.shopping,
      'Travelling': t.filters.travelling,
      'Miscellaneous': t.filters.miscellaneous,
      'Bill & Subscription': t.filters.bills,
    };
    return map[cat] || cat;
  };

  const getPaymentModeLabel = (mode: string) => {
    const map: Record<string, string> = {
      'Cash': t.expenses.paymentModeCash,
      'Credit Card': t.expenses.paymentModeCard,
      'Bank Transfer': t.expenses.paymentModeBank,
      'Digital Wallet': t.expenses.paymentModeWallet,
      'Other': t.expenses.paymentModeOther,
    };
    return map[mode] || mode;
  };

  const exportToCSV = () => {
    try {
      // Prepare data for CSV export
      const csvData = filteredExpenses.map(expense => ({
        Date: formatDateForDisplay(expense.date, language),
        Category: getCategoryLabel(expense.category),
        'Sub Category': expense.sub_category || '-',
        Description: expense.description || '-',
        Amount: expense.amount,
        'Payment Mode': getPaymentModeLabel(expense.mode),
      }));

      // Convert to CSV
      const csv = Papa.unparse(csvData);

      // Add BOM for Excel compatibility and create blob
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
      const filename = `expenses_${new Date().toISOString().split('T')[0]}.csv`;

      // Log for debugging
      console.log('CSV Export - Filename:', filename, 'Size:', blob.size);

      saveAs(blob, filename);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('Failed to export CSV. Error: ' + error);
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(18);
      doc.setTextColor(102, 126, 234);
      doc.text('Expense Report', 14, 20);

      // Add filter info and metadata
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Filter: ${getCategoryLabel(categoryFilter)}`, 14, 30);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36);
      doc.text(`Total Records: ${filteredExpenses.length}`, 14, 42);

      // Prepare table data
      const tableData = filteredExpenses.map(expense => [
        formatDateForDisplay(expense.date, language),
        getCategoryLabel(expense.category),
        expense.sub_category || '-',
        expense.description || '-',
        formatPrice(expense.amount),
        getPaymentModeLabel(expense.mode),
      ]);

      // Add table
      autoTable(doc, {
        head: [[t.expenses.date, t.expenses.category, t.expenses.subCategory, t.expenses.description, t.expenses.amount, t.expenses.mode]],
        body: tableData,
        startY: 50,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [102, 126, 234], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });

      // Add summary
      const finalY = (doc as any).lastAutoTable.finalY || 50;
      doc.setFontSize(12);
      doc.setFont('', 'bold');
      doc.text(`Total: ${formatPrice(totalAmount)}`, 14, finalY + 10);
      doc.text(`Count: ${filteredExpenses.length} transactions`, 14, finalY + 17);

      // Use FileSaver for reliable download
      const pdfBlob = doc.output('blob');
      const filename = `expenses_${new Date().toISOString().split('T')[0]}.pdf`;

      // Log for debugging
      console.log('PDF Export - Filename:', filename, 'Size:', pdfBlob.size);

      saveAs(pdfBlob, filename);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Error: ' + error);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch =
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.sub_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.category && getCategoryLabel(expense.category).toLowerCase().includes(searchTerm.toLowerCase())); // Search across translated label too? Or just original? Original is safer but user searches what they see.

    const matchesCategory = categoryFilter === 'All' || expense.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categories = ['All', ...Array.from(new Set(expenses.map(e => e.category)))];

  return (
    <Layout>

      <main className="expenses-main">
        <header className="expenses-header">
          <div className="header-greeting">
            <h1>
              <span className="gradient-text">{t.common.allExpenses}</span>
            </h1>
            <p>{t.common.expensesList}</p>
          </div>
          <div className="header-actions">
            <LanguageSwitcher />
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <div className="expenses-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper icon-wrapper-purple">
                  <LucideIcons.Wallet size={24} />
                </div>
                <h3 className="stat-title">{t.common.totalExpenses}</h3>
              </div>
              <div className="stat-amount">{formatPrice(totalAmount)}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper icon-wrapper-blue">
                  <LucideIcons.FileText size={24} />
                </div>
                <h3 className="stat-title">{t.common.count}</h3>
              </div>
              <div className="stat-amount">{filteredExpenses.length}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper icon-wrapper-orange">
                  <LucideIcons.PieChart size={24} color="#ffffff" style={{ color: '#ffffff', stroke: '#ffffff' }} strokeWidth={2.5} />
                </div>
                <h3 className="stat-title">{t.dashboard.topCategory}</h3>
              </div>
              {filteredExpenses.length > 0 ? (
                <>
                  <div className="stat-amount" style={{ fontSize: '1.5rem' }}>
                    {Object.entries(filteredExpenses.reduce((acc, curr) => {
                      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                      return acc;
                    }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'}
                  </div>
                  <div className="stat-label">
                    {formatPrice(Object.entries(filteredExpenses.reduce((acc, curr) => {
                      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
                      return acc;
                    }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1])[0]?.[1] || 0)}
                  </div>
                </>
              ) : (
                <div className="stat-amount">-</div>
              )}
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon-wrapper icon-wrapper-green">
                  <LucideIcons.Calculator size={24} />
                </div>
                <h3 className="stat-title">Average</h3>
              </div>
              <div className="stat-amount">
                {formatPrice(filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0)}
              </div>
              <div className="stat-label">Per transaction</div>
            </div>
          </div>

          <div className="expenses-controls">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder={t.common.searchPlaceholder}
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
                <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
              ))}
            </select>

            <div className="export-actions">
              <button
                className="export-btn csv-btn"
                onClick={exportToCSV}
                title={t.filters.exportCSV}
              >
                <FileText size={16} />
                CSV
              </button>

              <button
                className="export-btn pdf-btn"
                onClick={exportToPDF}
                title={t.filters.exportPDF}
              >
                <FileType size={16} />
                PDF
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>{t.common.loading}</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🧾</div>
              <h3>{t.expenses.noExpenses}</h3>
              <p>{t.common.addExpense.replace('Add', 'Track your first')}</p>
            </div>
          ) : (
            <div className="expenses-table-container">
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>{t.expenses.date}</th>
                    <th>{t.expenses.icon}</th>
                    <th>{t.expenses.category}</th>
                    <th>{t.expenses.subCategory}</th>
                    <th>{t.expenses.description}</th>
                    <th>{t.expenses.amount}</th>
                    <th>{t.expenses.mode}</th>
                    <th>{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => {
                    const Icon = (LucideIcons as any)[expense.icon] || LucideIcons.ShoppingCart;
                    return (
                      <tr key={expense.id}>
                        <td>{formatDateForDisplay(expense.date, language)}</td>
                        <td>
                          <div className="expense-icon">
                            <Icon size={20} />
                          </div>
                        </td>
                        <td><span className="category-badge">{getCategoryLabel(expense.category)}</span></td>
                        <td>{expense.sub_category || '-'}</td>
                        <td>{expense.description || '-'}</td>
                        <td className="amount">{formatPrice(expense.amount)}</td>
                        <td><span className="mode-badge">{getPaymentModeLabel(expense.mode)}</span></td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon edit"
                              onClick={() => handleEdit(expense)}
                              title={t.common.edit}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn-icon delete"
                              onClick={() => handleDeleteClick(expense)}
                              title={t.common.delete}
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
        title={t.common.addExpense}
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
        title={t.expenses.deleteTitle}
        message={t.expenses.deleteMessage}
        confirmText={t.common.delete}
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
          /* margin-left removed, handled by Layout */
          min-height: 100vh;
        }

        .expenses-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-6);
          background-color: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-6);
          margin-bottom: var(--space-6);
        }

        .stat-card {
          background: var(--color-bg-secondary);
          border-radius: var(--radius-2xl);
          padding: var(--space-5);
          box-shadow: var(--shadow-md);
          transition: all var(--transition-base);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-2xl);
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }

        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .icon-wrapper-purple {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .icon-wrapper-blue {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }

        .icon-wrapper-orange {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .icon-wrapper-green {
          background: linear-gradient(135deg, #4facfe 0%, #43e97b 100%);
          color: white;
        }

        .stat-title {
          font-size: var(--font-size-sm);
          color: var(--color-gray-600);
          font-weight: var(--font-weight-medium);
          margin: 0;
        }

        .stat-amount {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-gray-900);
          margin-bottom: var(--space-1);
        }

        .stat-label {
          font-size: var(--font-size-xs);
          color: var(--color-gray-500);
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

        .export-actions {
          display: flex;
          gap: var(--space-4);
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-5);
          border: 1px solid var(--color-gray-300);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          font-family: var(--font-family);
          font-weight: var(--font-weight-semibold);
          cursor: pointer;
          transition: all var(--transition-fast);
          background-color: var(--color-bg-secondary);
          color: var(--color-text-primary);
          min-width: 95px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          justify-content: center;
        }

        .export-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .csv-btn:hover {
          background-color: var(--color-primary-600);
          color: white;
          border-color: var(--color-primary-600);
        }

       .pdf-btn:hover {
          background-color: var(--color-error);
          color: white;
          border-color: var(--color-error);
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
          text-align: left;
          padding: var(--space-4);
          font-size: var(--font-size-sm);
          color: var(--color-gray-700);
          border-bottom: 1px solid var(--color-gray-100);
          white-space: nowrap;
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
          display: inline-block;
          text-align: center;
          padding: var(--space-2) var(--space-3);
          background-color: var(--color-primary-100);
          color: var(--color-primary-700);
          border-radius: var(--radius-md);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
        }

        .dark-mode .category-badge {
          color: var(--color-white);
          background-color: var(--color-primary-600); /* Also darken bg slightly for better contrast if needed, or keep primary-100? */
          /* primary-100 in dark mode is #312e81 (dark indigo). White text on #312e81 is good contrast (12:1). */
          /* If I keep bg primary-100, it's fine. */
        }

        .mode-badge {
          padding: var(--space-1) var(--space-3);
          background-color: var(--color-gray-100);
          border-radius: var(--radius-md);
          font-size: var(--font-size-xs);
          white-space: nowrap;
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
          text-align: center;
        }

        .empty-icon {
          font-size: 80px;
          margin-bottom: var(--space-4);
        }

        .empty-state h3 {
          font-size: var(--font-size-xl);
          color: var(--color-text-primary);
          margin-bottom: var(--space-2);
          font-weight: var(--font-weight-bold);
        }

        .empty-state p {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
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
          .expenses-main {
            padding: 0;
            max-width: 100vw;
            overflow-x: hidden;
            box-sizing: border-box;
          }

          .header-actions {
            display: none !important;
          }

          .stats-grid {
             grid-template-columns: repeat(2, 1fr) !important;
             gap: var(--space-4);
          }

          .expenses-controls {
            flex-direction: column;
            width: 100%;
          }

          .search-box {
            width: 100%;
          }

          .category-filter {
            min-width: 100%;
            overflow-x: auto;
            padding-bottom: 4px; /* Space for scrollbar */
          }

          .export-actions {
            width: 100%;
          }

          .export-btn {
            flex: 1;
          }

          .expenses-content {
            padding: var(--space-4);
            overflow: hidden;
            border-radius: var(--radius-2xl); /* Ensure border radius matches cards */
          }

          .expenses-table-container {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            margin-top: var(--space-4);
          }

          .expenses-table {
            min-width: 600px; /* Reduced to fit better */
          }
        }
      `}</style>
    </Layout>
  );
};

export default AllExpenses;
