import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Target, Calendar } from 'lucide-react';
import Layout from '../components/Layout';
import ThemeToggle from '../components/ThemeToggle';
import UserMenu from '../components/UserMenu';
import ConfirmationModal from '../components/ConfirmationModal';
import { goalsAPI } from '../services/api';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../context/LanguageContext';
import ImageCropperModal from '../components/ImageCropperModal';

interface Goal {
    id: number;
    user_id: number;
    name: string;
    target_amount: number;
    current_amount: number;
    deadline?: string;
    color?: string;
    icon?: string;
    imageUrl?: string;
    image_url?: string; // Backend field
}

const Goals: React.FC = () => {
    const { t } = useLanguage();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        target_amount: '',
        current_amount: '',
        deadline: '',
        color: '#3B82F6',
        icon: 'Target',
        imageUrl: ''
    });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState<number | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const loadGoals = async () => {
        try {
            setLoading(true);
            const data = await goalsAPI.getAll();
            setGoals(data);
        } catch (error) {
            console.error('Error loading goals:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGoals();
    }, []);

    if (loading) {
        return (
            <Layout>
                <div className="dashboard-loading">
                    <div className="spinner" />
                    <p>{t.common.loading}</p>
                </div>
            </Layout>
        );
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result as string);
                setIsCropperOpen(true);
            };
            reader.readAsDataURL(file);
        }
        // Reset input value so same file can be selected again if needed
        e.target.value = '';
    };

    const handleCropComplete = (croppedBlob: Blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            setIsCropperOpen(false);
            setTempImage(null);
        };
        reader.readAsDataURL(croppedBlob);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveError(null);
        try {
            const payload = {
                ...formData,
                target_amount: parseFloat(formData.target_amount),
                current_amount: parseFloat(formData.current_amount) || 0,
                // Backend expects image data in 'icon' field if it's an image goal
                icon: formData.imageUrl ? formData.imageUrl : formData.icon
            };

            // Remove helper fields not needed by backend
            const { imageUrl, ...finalPayload } = payload;

            console.log('Sending payload:', finalPayload);

            if (editingGoal) {
                await goalsAPI.update(editingGoal.id, finalPayload);
            } else {
                await goalsAPI.create(finalPayload);
            }
            setIsModalOpen(false);
            resetForm();
            loadGoals();
        } catch (error) {
            console.error('Error saving goal:', error);
            setSaveError("Failed to save goal. Please check input and try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            target_amount: '',
            current_amount: '',
            deadline: '',
            color: '#3B82F6',
            icon: 'Target',
            imageUrl: ''
        });
        setEditingGoal(null);
        setSaveError(null);
    };

    const handleEdit = (goal: Goal) => {
        setEditingGoal(goal);
        setFormData({
            name: goal.name,
            target_amount: goal.target_amount.toString(),
            current_amount: goal.current_amount.toString(),
            deadline: goal.deadline || '',
            color: goal.color || '#3B82F6',
            icon: goal.icon || 'Target',
            imageUrl: goal.icon && goal.icon.startsWith('data:') ? goal.icon : '' // If icon is actually data URI, treat as Image
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setGoalToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (goalToDelete) {
            try {
                await goalsAPI.delete(goalToDelete);
                loadGoals();
            } catch (error) {
                console.error('Error deleting goal:', error);
            } finally {
                setIsDeleteModalOpen(false);
                setGoalToDelete(null);
            }
        }
    };

    const formatCurrency = (amount: number) => {
        // Basic formatting, ideally should use currency from user settings but using generic for now
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    const calculateProgress = (current: number, target: number) => {
        if (target <= 0) return 0;
        return Math.min(Math.round((current / target) * 100), 100);
    };

    return (
        <Layout>
            <main className="goals-main">
                <header className="goals-header">
                    <div className="header-greeting">
                        <h1>
                            <span className="gradient-text">{t.common.goals}</span>
                        </h1>
                        <p>{goals.length > 0 ? (t.goals.subtitleWithGoals || 'Set your financial goals and achieve them') : (t.goals.addFirstGoal || 'Set your first financial goal')}</p>
                    </div>
                    <div className="header-actions">
                        <LanguageSwitcher />
                        <ThemeToggle />
                        <UserMenu />
                    </div>
                </header>

                <div className="goals-content">
                    <div className="goals-grid">
                        {goals.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">🎯</div>
                                <h3>{t.goals.noGoals}</h3>
                                <p>{t.goals.addFirstGoal}</p>
                            </div>
                        ) : (
                            goals.map((goal) => {
                                const progress = calculateProgress(goal.current_amount, goal.target_amount);
                                return (
                                    <div key={goal.id} className="goal-card">
                                        <div className="goal-actions-absolute">
                                            <button className="btn-icon" onClick={() => handleEdit(goal)}>
                                                <Edit size={16} />
                                            </button>
                                            <button className="btn-icon danger" onClick={() => handleDelete(goal.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="goal-image-container" style={{ background: (!(goal.imageUrl || goal.image_url || (goal.icon && goal.icon.startsWith('data:'))) && goal.color) ? goal.color : 'transparent' }}>
                                            {(goal.imageUrl || goal.image_url || (goal.icon && goal.icon.startsWith('data:'))) ? (
                                                <img src={goal.imageUrl || goal.image_url || goal.icon} alt={goal.name} className="goal-image" />
                                            ) : (
                                                <div className="goal-icon-large" style={{ background: goal.color || '#3B82F6' }}>
                                                    <Target size={40} color="white" />
                                                </div>
                                            )}
                                        </div>

                                        <h3>{goal.name}</h3>

                                        <div className="goal-amounts">
                                            <span className="current">{formatCurrency(goal.current_amount)}</span>
                                            <span className="target"> / {formatCurrency(goal.target_amount)}</span>
                                        </div>

                                        <div className="progress-container">
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${progress}%`, background: goal.color || '#3B82F6' }} />
                                            </div>
                                            <span className="progress-text">{progress}%</span>
                                        </div>

                                        {goal.deadline && (
                                            <div className="goal-deadline">
                                                <Calendar size={14} />
                                                <span>{new Date(goal.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </main>

            <button
                className="fab"
                onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                }}
                title={t.modals.addGoalTitle || 'Add Goal'}
            >
                <Plus size={24} />
            </button>

            {/* Goal Modal */}
            {isModalOpen && (
                <>
                    <div className="modal-backdrop" onClick={() => setIsModalOpen(false)} />
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{editingGoal ? (t.modals.editGoalTitle || 'Edit Goal') : (t.modals.addGoalTitle || 'Add Goal')}</h2>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            {saveError && (
                                <div className="error-message" style={{ color: 'var(--color-error)', marginBottom: '1rem', padding: '0.5rem', background: '#fee2e2', borderRadius: '4px' }}>
                                    {saveError}
                                </div>
                            )}
                            <div className="form-group">
                                <label className="form-label">{t.goals.goalName}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder={t.goals.namePlaceholder}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">{t.goals.targetAmount}</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.target_amount}
                                        onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                                        required
                                        step="0.01"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t.goals.currentAmount}</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.current_amount}
                                        onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    {t.goals.deadline}
                                    <span style={{ opacity: 0.5, fontSize: '0.85em', fontWeight: 'normal', marginLeft: '6px' }}>({t.common.optional || 'Optional'})</span>
                                </label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    {t.goals.goalImage || 'Goal Image'}
                                    <span style={{ opacity: 0.5, fontSize: '0.85em', fontWeight: 'normal', marginLeft: '6px' }}>({t.common.optional || 'Optional'})</span>
                                </label>
                                <div className="image-upload-wrapper">
                                    {formData.imageUrl && (
                                        <div className="image-preview-box">
                                            <img src={formData.imageUrl} alt="Preview" />
                                            <button type="button" className="remove-image" onClick={() => setFormData({ ...formData, imageUrl: '' })}>×</button>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="form-input file-input"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                                    {t.common.cancel}
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                    {isSaving ? (t.modals.saving || 'Saving...') : (editingGoal ? t.common.save : t.common.addExpense.replace('Expense', 'Goal'))}
                                </button>
                            </div>
                        </form>
                    </div>
                    <ImageCropperModal
                        isOpen={isCropperOpen}
                        imageSrc={tempImage}
                        onClose={() => setIsCropperOpen(false)}
                        onCropComplete={handleCropComplete}
                        title={t.goals.goalImage || "Crop Goal Image"}
                        cropShape="rect"
                    />
                </>
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setGoalToDelete(null);
                }}
                onConfirm={confirmDelete}
                title={t.goals.deleteTitle}
                message={t.goals.deleteMessage}
                confirmText={t.common.delete}
                cancelText={t.common.cancel}
                type="danger"
            />

            <style>{`
        .goals-main {
          flex: 1;
          /* margin-left removed, handled by Layout */
          min-height: 100vh;
        }

        .goals-header {
           display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-6);
          background-color: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
        }

        .goals-header h1 {
          font-size: var(--font-size-2xl);
          margin-bottom: var(--space-1);
        }

        .goals-header h1 .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
         .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .goals-content {
          padding: var(--space-6);
        }

        .goals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-4);
        }

        .goal-card {
           background-color: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          align-items: center; /* Center everything */
          text-align: center; /* Center text */
          gap: var(--space-4);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
        }

        .goal-card:hover {
           box-shadow: var(--shadow-lg);
          transform: translateY(-4px);
        }

        .goal-actions-absolute {
           position: absolute;
           top: var(--space-4);
           right: var(--space-4);
           display: flex;
           gap: var(--space-2);
        }

        .goal-image-container {
            width: 80px;
            height: 80px;
            margin-top: var(--space-2);
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-xl);
            overflow: hidden;
        }

        .goal-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .goal-icon-large {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            /* border-radius inherited from container or set here */
        }

        .btn-icon {
           padding: var(--space-2);
           background: rgba(255, 255, 255, 0.1);
           border: none;
           cursor: pointer;
           color: var(--color-text-secondary);
           border-radius: var(--radius-md);
        }
        
        .goal-card:hover .btn-icon {
            background: var(--color-bg-tertiary);
        }

        .btn-icon:hover {
            color: var(--color-text-primary);
        }
        
        .btn-icon.danger:hover {
            color: var(--color-error);
            background: #fee2e2;
        }

        .goal-card h3 {
           margin: 0;
           font-size: var(--font-size-xl);
           color: var(--color-text-primary);
           font-weight: bold;
        }

        .goal-amounts {
           display: flex;
           align-items: baseline;
           justify-content: center;
        }

        .goal-amounts .current {
           font-size: var(--font-size-lg);
           font-weight: bold;
           color: var(--color-text-primary);
        }

        .goal-amounts .target {
           font-size: var(--font-size-sm);
           color: var(--color-text-secondary);
           margin-left: var(--space-1);
        }

        .progress-container {
           width: 100%;
           display: flex;
           align-items: center;
           gap: var(--space-2);
        }

        .progress-bar {
           flex: 1;
           height: 8px;
           background: var(--color-gray-200);
           border-radius: 4px;
           overflow: hidden;
        }

        .progress-fill {
           height: 100%;
           border-radius: 4px;
           transition: width 0.5s ease;
        }

        .progress-text {
           font-size: var(--font-size-xs);
           font-weight: bold;
           color: var(--color-text-secondary);
           width: 35px;
           text-align: right;
        }

        .goal-deadline {
           display: flex;
           align-items: center;
           gap: var(--space-2);
           font-size: var(--font-size-xs);
           color: var(--color-text-tertiary);
           margin-top: auto;
        }
        
        /* Modal - Image Upload */
        .image-upload-wrapper {
            display: flex;
            flex-direction: column;
            gap: var(--space-2);
        }
        
        .image-preview-box {
            width: 100px;
            height: 100px;
            position: relative;
            border-radius: var(--radius-lg);
            overflow: hidden;
            border: 1px solid var(--color-border);
        }
        
        .image-preview-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .remove-image {
            position: absolute;
            top: 0;
            right: 0;
            background: rgba(0,0,0,0.5);
            color: white;
            border: none;
            width: 24px;
            height: 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .file-input {
            padding: var(--space-2);
        }

        /* Modal Styles Reuse */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: var(--z-modal-backdrop);
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
        }
        
        .modal-header {
           padding: var(--space-6);
           border-bottom: 1px solid var(--color-border);
           display: flex;
           justify-content: space-between;
           align-items: center;
        }

        .modal-close {
           background: none;
           border: none;
           font-size: 24px;
           cursor: pointer;
           color: var(--color-text-secondary);
        }
        
        .modal-form {
           padding: var(--space-6);
           max-height: 80vh;
           overflow-y: auto;
        }

        .form-group {
           margin-bottom: var(--space-4);
        }
        
        .form-row {
           display: grid;
           grid-template-columns: 1fr 1fr;
           gap: var(--space-4);
        }

        .form-label {
           display: block;
           margin-bottom: var(--space-2);
           color: var(--color-text-secondary);
           font-size: var(--font-size-sm);
        }

        .form-input {
           width: 100%;
           padding: var(--space-3);
           border-radius: var(--radius-lg);
           border: 1px solid var(--color-border);
           background: var(--color-bg-primary);
           color: var(--color-text-primary);
        }
        
        .modal-footer {
           display: flex;
           justify-content: flex-end;
           gap: var(--space-4);
           margin-top: var(--space-6);
        }

        .btn {
           padding: var(--space-3) var(--space-6);
           border-radius: var(--radius-lg);
           border: none;
           cursor: pointer;
           font-weight: var(--font-weight-medium);
        }

        .btn-secondary {
           background: var(--color-bg-tertiary);
           color: var(--color-text-primary);
        }

        .btn-primary {
           background: var(--color-primary-600);
           color: white;
        }

        .fab {
           position: fixed;
           bottom: var(--space-8);
           right: var(--space-8);
           width: 56px;
           height: 56px;
           border-radius: 50%;
           background: var(--color-primary-600);
           color: white;
           border: none;
           box-shadow: var(--shadow-lg);
           display: flex;
           align-items: center;
           justify-content: center;
           cursor: pointer;
           z-index: 100;
           transition: transform 0.2s;
        }

        .fab:hover {
           transform: scale(1.1);
        }
        
        @media (max-width: 768px) {
           .goals-main {
              margin-left: 0;
           }
           .goals-header h1 {
              font-size: var(--font-size-xl);
           }
           .form-row {
              grid-template-columns: 1fr;
            }
           .header-actions {
              display: none;
           }
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
         
         .empty-state .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: var(--space-2);
         }
      `}</style>
        </Layout>
    );
};

export default Goals;
