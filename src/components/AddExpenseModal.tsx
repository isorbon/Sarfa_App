import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import IconPicker from './IconPicker';
import { cardsAPI } from '../services/api';
import type { Expense } from '../types';

interface AddExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (expense: Partial<Expense>) => Promise<void>;
    expense?: Expense | null;
    defaultCategory?: string;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
    isOpen,
    onClose,
    onSubmit,

    expense,
    defaultCategory = 'Food & Grocery',
}) => {
    const [formData, setFormData] = useState({
        amount: '',
        category: defaultCategory,
        sub_category: '',
        description: '',
        icon: 'ShoppingCart',
        date: new Date().toISOString().split('T')[0],
        mode: 'Cash',
        card_id: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [cards, setCards] = useState<any[]>([]);

    useEffect(() => {
        if (expense) {
            setFormData({
                amount: expense.amount.toString(),
                category: expense.category,
                sub_category: expense.sub_category || '',
                description: expense.description || '',
                icon: expense.icon,
                date: expense.date,
                mode: expense.mode,
                card_id: (expense as any).card_id || '',
            });
        } else {
            setFormData({
                amount: '',
                category: defaultCategory,
                sub_category: '',
                description: '',
                icon: 'ShoppingCart',
                date: new Date().toISOString().split('T')[0],
                mode: 'Cash',
                card_id: '',
            });
        }
    }, [expense]);

    useEffect(() => {
        const loadCards = async () => {
            try {
                const data = await cardsAPI.getAll();
                setCards(data);
            } catch (error) {
                console.error('Error loading cards:', error);
            }
        };
        if (isOpen) {
            loadCards();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await onSubmit({
                ...formData,
                amount: parseFloat(formData.amount),
            });
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-backdrop" onClick={onClose} />
            <div className="modal">
                <div className="modal-header">
                    <h2>{expense ? 'Edit Expense' : 'Add New Expense'}</h2>
                    <button className="modal-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div className="error-alert">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="amount" className="form-label">
                                Amount (EUR) *
                            </label>
                            <input
                                id="amount"
                                type="number"
                                step="0.01"
                                min="0"
                                className="form-input"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="date" className="form-label">
                                Date *
                            </label>
                            <input
                                id="date"
                                type="date"
                                className="form-input"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="category" className="form-label">
                                Category *
                            </label>
                            <select
                                id="category"
                                className="form-select"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="Food & Grocery">Food & Grocery</option>
                                <option value="Investment">Investment</option>
                                <option value="Shopping">Shopping</option>
                                <option value="Travelling">Travelling</option>
                                <option value="Miscellaneous">Miscellaneous</option>
                                <option value="Bill & Subscription">Bill & Subscription</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="sub_category" className="form-label">
                                Sub Category
                            </label>
                            <input
                                id="sub_category"
                                type="text"
                                className="form-input"
                                placeholder="e.g., Amazon, Netflix"
                                value={formData.sub_category}
                                onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Icon
                        </label>
                        <IconPicker
                            value={formData.icon}
                            onChange={(icon) => setFormData({ ...formData, icon })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description" className="form-label">
                            Description
                        </label>
                        <textarea
                            id="description"
                            className="form-input"
                            placeholder="Add a note..."
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="mode" className="form-label">
                            Payment Mode *
                        </label>
                        <select
                            id="mode"
                            className="form-select"
                            value={formData.mode}
                            onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                            required
                        >
                            <option value="Cash">Cash</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Digital Wallet">Digital Wallet</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {formData.mode === 'Credit Card' && (
                        <div className="form-group">
                            <label htmlFor="card" className="form-label">
                                Card {cards.length > 0 && '*'}
                            </label>
                            {cards.length === 0 ? (
                                <div className="no-cards-message">
                                    <p>No cards available. Please add a card from the Cards page first.</p>
                                </div>
                            ) : (
                                <select
                                    id="card"
                                    className="form-select"
                                    value={formData.card_id}
                                    onChange={(e) => setFormData({ ...formData, card_id: e.target.value })}
                                    required
                                >
                                    <option value="">Select a card</option>
                                    {cards.map((card: any) => (
                                        <option key={card.id} value={card.id}>
                                            {card.name} - {card.bank}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : expense ? 'Update Expense' : 'Add Expense'}
                        </button>
                    </div>
                </form>

                <style>{`
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
            max-width: 600px;
            max-height: 90vh;
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
          }

          .modal-close:hover {
            background-color: var(--color-bg-tertiary);
            color: var(--color-text-primary);
          }

          .error-alert {
            margin: var(--space-6) var(--space-6) 0;
            background-color: #fee2e2;
            border-left: 4px solid var(--color-error);
            color: #991b1b;
            padding: var(--space-4);
            border-radius: var(--radius-md);
            font-size: var(--font-size-sm);
          }

          .dark-mode .error-alert {
            background-color: rgba(239, 68, 68, 0.1);
            color: #fca5a5;
          }

          .modal-form {
            padding: var(--space-6);
            overflow-y: auto;
            max-height: calc(90vh - 180px);
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--space-4);
          }

          .no-cards-message {
            padding: var(--space-4);
            background-color: var(--color-bg-tertiary);
            border-radius: var(--radius-md);
            border: 1px solid var(--color-border);
          }

          .no-cards-message p {
            margin: 0;
            color: var(--color-text-secondary);
            font-size: var(--font-size-sm);
          }

          .modal-footer {
            display: flex;
            gap: var(--space-4);
            justify-content: flex-end;
            padding: var(--space-6);
            border-top: 1px solid var(--color-border);
            background-color: var(--color-bg-secondary);
          }

          textarea.form-input {
            resize: vertical;
            min-height: 80px;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
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

          @media (max-width: 640px) {
            .form-row {
              grid-template-columns: 1fr;
            }

            .modal {
              width: 95%;
              max-height: 95vh;
            }
          }
        `}</style>
            </div>
        </>
    );
};

export default AddExpenseModal;
