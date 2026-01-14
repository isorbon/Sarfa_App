import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CreditCard } from 'lucide-react';
import Layout from '../components/Layout';
import ThemeToggle from '../components/ThemeToggle';
import UserMenu from '../components/UserMenu';
import ConfirmationModal from '../components/ConfirmationModal';
import { cardsAPI, expensesAPI } from '../services/api';

interface Card {
  id: number;
  name: string;
  bank: string;
  user_id: number;
  card_type?: string;
}



const cardTypes = [
  { id: 'visa', name: 'Visa', image: '/icons/visa.png' },
  { id: 'mastercard', name: 'Mastercard', image: '/icons/mastercard.png' },
  { id: 'amex', name: 'Amex', image: '/icons/amex.png' },
  { id: 'maestro', name: 'Maestro', image: '/icons/maestro.png' },
  { id: 'generic', name: 'Other', Component: CreditCard, gradient: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)' },
];

import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

import CardsStatsChart from '../components/CardsStatsChart';

const Cards: React.FC = () => {
  const { t } = useLanguage();
  const [cards, setCards] = useState<Card[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [formData, setFormData] = useState({ name: '', bank: '', card_type: 'generic' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<number | null>(null);

  const loadCards = async () => {
    try {
      setLoading(true);
      // Fetch cards alone first to ensure they render
      const cardsData = await cardsAPI.getAll();
      setCards(cardsData);

      // Attempt to fetch stats separately
      try {
        const statsData = await cardsAPI.getStats();
        if (statsData && statsData.length > 0) {
          setStats(statsData);
        } else {
          throw new Error('No stats from backend');
        }
      } catch (statsError) {
        console.warn('Failed to load backend stats, trying fallback:', statsError);
        // Fallback: Calculate from all expenses
        try {
          const allExpenses = await expensesAPI.getAll();
          const fallbackStats = allExpenses
            .filter(e => e.card_id)
            .reduce((acc: any, expense) => {
              const month = expense.date.substring(0, 7);
              const card = cardsData.find(c => c.id === expense.card_id);
              if (!card) return acc;

              const key = `${expense.card_id}-${month}`;
              if (!acc[key]) {
                acc[key] = {
                  card_id: expense.card_id,
                  card_name: card.name,
                  month: month,
                  total_amount: 0
                };
              }
              acc[key].total_amount += Number(expense.amount);
              return acc;
            }, {});
          setStats(Object.values(fallbackStats));
        } catch (fallbackError) {
          console.error('Fallback stats failed:', fallbackError);
        }
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCard) {
        await cardsAPI.update(editingCard.id, formData);
      } else {
        await cardsAPI.create(formData);
      }
      setIsModalOpen(false);
      setFormData({ name: '', bank: '', card_type: 'generic' });
      setEditingCard(null);
      loadCards();
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  const handleEdit = (card: Card) => {
    setEditingCard(card);
    setFormData({ name: card.name, bank: card.bank, card_type: card.card_type || 'generic' });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setCardToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (cardToDelete) {
      try {
        await cardsAPI.delete(cardToDelete);
        loadCards();
      } catch (error) {
        console.error('Error deleting card:', error);
      } finally {
        setIsDeleteModalOpen(false);
        setCardToDelete(null);
      }
    }
  };

  return (
    <Layout>
      <main className="cards-main">
        <header className="cards-header">
          {/* ... */}
          <div className="header-greeting">
            <h1>
              <span className="gradient-text">{t.common.cards}</span>
            </h1>
            <p>{t.common.manageCards}</p>
          </div>
          <div className="header-actions">
            <LanguageSwitcher />
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <div className="cards-content">
          {/* Chart Section */}
          {!loading && <CardsStatsChart data={stats} />}

          <div className="cards-grid">
            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>{t.common.loading}</p>
              </div>
            ) : cards.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💳</div>
                <h3>{t.cards.noCards}</h3>
                <p>{t.cards.addFirstCard}</p>
              </div>
            ) : (
              cards.map((card) => (
                <div key={card.id} className="card-item">
                  <div
                    className="card-icon"
                    style={{
                      background: (card.card_type === 'generic' || !card.card_type) ? 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)' : 'white',
                      border: (card.card_type === 'generic' || !card.card_type) ? 'none' : '1px solid var(--color-gray-200)',
                      padding: (card.card_type === 'generic' || !card.card_type) ? '0' : '8px'
                    }}
                  >
                    {(() => {
                      const type = cardTypes.find(t => t.id === (card.card_type || 'generic')) || cardTypes[4];
                      if (type.image) {
                        return <img src={type.image} alt={type.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
                      }
                      const Icon = type.Component || CreditCard;
                      return <Icon size={48} color="white" />;
                    })()}
                  </div>
                  <div className="card-details">
                    <h3>{card.name}</h3>
                    <p>{card.bank}</p>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(card)}
                      title={t.modals.editCardTitle}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDelete(card.id)}
                      title={t.cards.deleteTitle}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        className="fab"
        onClick={() => {
          setEditingCard(null);
          setFormData({ name: '', bank: '', card_type: 'generic' });
          setIsModalOpen(true);
        }}
        title={t.common.addCard}
      >
        <Plus size={24} />
      </button>

      {/* Card Modal */}
      {isModalOpen && (
        <>
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)} />
          <div className="modal">
            <div className="modal-header">
              <h2>{editingCard ? t.modals.editCardTitle : t.modals.addCardTitle}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="card-name" className="form-label">
                  {t.cards.cardName} *
                </label>
                <input
                  id="card-name"
                  type="text"
                  className="form-input"
                  placeholder={t.cards.namePlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bank" className="form-label">
                  {t.cards.bank} *
                </label>
                <input
                  id="bank"
                  type="text"
                  className="form-input"
                  placeholder={t.cards.bankPlaceholder}
                  value={formData.bank}
                  onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Card Type</label>
                <div className="card-type-grid">
                  {cardTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      className={`card-type-option ${formData.card_type === type.id ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, card_type: type.id })}
                      title={type.name}
                      style={{
                        background: type.gradient || 'white',
                        border: type.image ? '1px solid var(--color-gray-200)' : 'none'
                      }}
                    >
                      {type.image ? (
                        <img src={type.image} alt={type.name} style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                      ) : (
                        type.Component && <type.Component size={24} color="white" />
                      )}

                      {formData.card_type === type.id && <div className="selected-indicator">✓</div>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  {t.common.cancel}
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCard ? t.common.save : t.common.addCard}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCardToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={t.cards.deleteTitle}
        message={t.cards.deleteMessage}
        confirmText={t.common.delete}
        cancelText={t.common.cancel}
        type="danger"
      />

      <style>{`
        .cards-page {
          display: flex;
          min-height: 100vh;
          background-color: var(--color-bg-primary);
        }

        .cards-main {
          flex: 1;
          margin-left: 260px;
          min-height: 100vh;
        }

        .cards-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-6);
          background-color: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
        }

        .cards-header h1 {
          font-size: var(--font-size-2xl);
          margin-bottom: var(--space-1);
        }

        .cards-header h1 .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .cards-header p {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .cards-content {
          padding: var(--space-6);
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--space-4);
        }

        .card-item {
          background-color: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: var(--space-3);
          transition: all 0.2s;
          min-height: 180px;
          justify-content: center;
        }

        .card-item:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-4px);
        }

        .card-icon {
          width: 70px;
          height: 70px;
          border-radius: var(--radius-xl);
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-gray-900);
          flex-shrink: 0;
          box-shadow: var(--shadow-sm);
          margin-top: var(--space-2);
          overflow: hidden;
          padding: var(--space-2);
        }

        .card-details {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .card-details h3 {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
          margin: 0;
        }

        .card-details p {
          font-size: var(--font-size-base);
          color: var(--color-text-secondary);
          margin: 0;
        }

        .card-actions {
          display: flex;
          gap: var(--space-3);
          margin-top: auto;
        }

        .btn-icon {
          padding: var(--space-3);
          background-color: var(--color-bg-tertiary);
          border: 1px solid transparent;
          border-radius: var(--radius-lg);
          cursor: pointer;
          color: var(--color-text-secondary);
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background-color: var(--color-gray-200);
          color: var(--color-text-primary);
          transform: translateY(-2px);
        }

        .btn-icon.danger:hover {
          background-color: #fee2e2;
          color: var(--color-error);
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: var(--space-16);
          display: flex;
          flex-direction: column;
          align-items: center;
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
          margin-bottom: var(--space-6);
        }

        .loading-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: var(--space-12);
        }

        .loading-state .spinner {
          width: 40px;
          height: 40px;
          margin: 0 auto var(--space-4);
          border: 3px solid var(--color-gray-200);
          border-top-color: var(--color-primary-600);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: var(--z-modal-backdrop);
          animation: fadeIn 0.2s ease-out;
        }

        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 500px;
          background-color: var(--color-bg-secondary);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-2xl);
          z-index: var(--z-modal);
          overflow: hidden;
          animation: slideIn 0.3s ease-out;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-6);
          border-bottom: 1px solid var(--color-border);
        }

        .modal-header h2 {
          font-size: var(--font-size-2xl);
          color: var(--color-text-primary);
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: var(--space-2);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          font-size: 24px;
        }

        .modal-close:hover {
          background-color: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }

        .modal-form {
          padding: var(--space-6);
        }

        .modal-footer {
          display: flex;
          gap: var(--space-4);
          justify-content: flex-end;
          padding: var(--space-6);
          padding-top: 0;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideIn {
          from {
            transform: translate(-50%, -48%);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%);
            opacity: 1;
          }
        }


        .card-type-grid {
          display: flex;
          gap: var(--space-3);
          margin-top: var(--space-2);
        }

        .card-type-option {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          position: relative;
          transition: transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-type-option:hover {
          transform: scale(1.1);
        }

        .card-type-option.selected {
          border-color: var(--color-text-primary);
          transform: scale(1.1);
          box-shadow: 0 0 0 2px var(--color-bg-secondary), 0 0 0 4px var(--color-primary-600);
        }

        .selected-indicator {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-primary-600);
          font-weight: bold;
          font-size: 24px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
        }

        @media (max-width: 768px) {
          .cards-main {
            margin-left: 0;
          }

          .cards-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-3);
          }


          /* Restore original mobile sizes */
          .card-item {
            padding: var(--space-6);
            gap: var(--space-4);
            min-height: 240px;
          }

          .card-icon {
            width: 60px;
            height: 60px;
          }

          .card-details h3 {
            font-size: var(--font-size-lg);
          }

          .header-actions {
            display: none;
          }

          .modal {
            width: 95%;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Cards;
