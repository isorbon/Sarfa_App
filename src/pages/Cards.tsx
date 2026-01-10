import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CreditCard } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import UserMenu from '../components/UserMenu';
import ConfirmationModal from '../components/ConfirmationModal';
import { cardsAPI } from '../services/api';

interface Card {
  id: number;
  name: string;
  bank: string;
  user_id: number;
}

import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';

const Cards: React.FC = () => {
  const { t } = useLanguage();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [formData, setFormData] = useState({ name: '', bank: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<number | null>(null);

  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await cardsAPI.getAll();
      setCards(data);
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
      setFormData({ name: '', bank: '' });
      setEditingCard(null);
      loadCards();
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  const handleEdit = (card: Card) => {
    setEditingCard(card);
    setFormData({ name: card.name, bank: card.bank });
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
    <div className="cards-page">
      <Sidebar />

      <main className="cards-main">
        <header className="cards-header">
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
          <div className="cards-grid">
            {loading ? (
              <div className="loading-state">
                <div className="spinner" />
                <p>{t.common.loading}</p>
              </div>
            ) : cards.length === 0 ? (
              <div className="empty-state">
                <CreditCard size={48} />
                <p>{t.cards.noCards}</p>
                <p className="empty-subtitle">{t.cards.addFirstCard}</p>
              </div>
            ) : (
              cards.map((card) => (
                <div key={card.id} className="card-item">
                  <div className="card-icon">
                    <CreditCard size={32} />
                  </div>
                  <div className="card-details">
                    <h3>{card.name}</h3>
                    <p>{card.bank}</p>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(card)}
                      title="Edit card"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDelete(card.id)}
                      title="Delete card"
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
          setFormData({ name: '', bank: '' });
          setIsModalOpen(true);
        }}
        title="Add Card"
      >
        <Plus size={24} />
      </button>

      {/* Card Modal */}
      {isModalOpen && (
        <>
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)} />
          <div className="modal">
            <div className="modal-header">
              <h2>{editingCard ? 'Edit Card' : 'Add New Card'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="card-name" className="form-label">
                  Card Name *
                </label>
                <input
                  id="card-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Visa Gold"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bank" className="form-label">
                  Bank *
                </label>
                <input
                  id="bank"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Chase Bank"
                  value={formData.bank}
                  onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCard ? 'Update Card' : 'Add Card'}
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
        title="Delete Card"
        message="Are you sure you want to delete this card? This action cannot be undone."
        confirmText="Delete"
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
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-4);
        }

        .card-item {
          background-color: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          display: flex;
          align-items: center;
          gap: var(--space-4);
          transition: all 0.2s;
        }

        .card-item:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .card-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, var(--color-primary-600), var(--color-blue-500));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .card-details {
          flex: 1;
        }

        .card-details h3 {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          margin-bottom: var(--space-1);
        }

        .card-details p {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          margin: 0;
        }

        .card-actions {
          display: flex;
          gap: var(--space-2);
        }

        .btn-icon {
          padding: var(--space-2);
          background: none;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          color: var(--color-text-secondary);
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background-color: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }

        .btn-icon.danger:hover {
          background-color: rgba(239, 68, 68, 0.1);
          border-color: var(--color-error);
          color: var(--color-error);
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: var(--space-12);
          color: var(--color-text-secondary);
        }

        .empty-state svg {
          margin: 0 auto var(--space-4);
          color: var(--color-gray-400);
        }

        .empty-state p {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-medium);
          margin-bottom: var(--space-2);
        }

        .empty-subtitle {
          font-size: var(--font-size-sm) !important;
          color: var(--color-text-secondary) !important;
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

        @media (max-width: 768px) {
          .cards-main {
            margin-left: 0;
          }

          .cards-grid {
            grid-template-columns: 1fr;
          }

          .modal {
            width: 95%;
          }
        }
      `}</style>
    </div>
  );
};

export default Cards;
