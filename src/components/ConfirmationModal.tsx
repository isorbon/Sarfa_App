import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger'
}) => {
    if (!isOpen) return null;

    return (
        <>
            <div className="modal-backdrop" onClick={onClose} />
            <div className="modal-container">
                <div className={`modal-icon ${type}`}>
                    <AlertCircle size={32} />
                </div>

                <div className="modal-content">
                    <h3 className="modal-title">{title}</h3>
                    <p className="modal-message">{message}</p>
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button
                        className={`btn-confirm ${type}`}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </button>
                </div>

                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                <style>{`
                    .modal-backdrop {
                        position: fixed;
                        inset: 0;
                        background-color: rgba(0, 0, 0, 0.5);
                        z-index: 50;
                        animation: fadeIn 0.2s ease-out;
                    }

                    .modal-container {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 90%;
                        max-width: 400px;
                        background: white;
                        border-radius: 16px;
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                        z-index: 51;
                        padding: 24px;
                        text-align: center;
                        animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    }

                    .modal-icon {
                        width: 48px;
                        height: 48px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 16px;
                    }

                    .modal-icon.danger {
                        background-color: #fee2e2;
                        color: #dc2626;
                    }

                    .modal-icon.warning {
                        background-color: #fef3c7;
                        color: #d97706;
                    }

                    .modal-icon.info {
                        background-color: #e0f2fe;
                        color: #0284c7;
                    }

                    .modal-title {
                        font-size: 18px;
                        font-weight: 600;
                        color: #111827;
                        margin-bottom: 8px;
                    }

                    .modal-message {
                        font-size: 14px;
                        color: #6b7280;
                        margin-bottom: 24px;
                        line-height: 1.5;
                    }

                    .modal-actions {
                        display: flex;
                        gap: 12px;
                        justify-content: center;
                    }

                    .btn-cancel {
                        padding: 8px 16px;
                        border-radius: 8px;
                        background-color: white;
                        border: 1px solid #d1d5db;
                        color: #374151;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s;
                    }

                    .btn-cancel:hover {
                        background-color: #f9fafb;
                    }

                    .btn-confirm {
                        padding: 8px 16px;
                        border-radius: 8px;
                        border: none;
                        color: white;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s;
                    }

                    .btn-confirm.danger {
                        background-color: #dc2626;
                    }

                    .btn-confirm.danger:hover {
                        background-color: #b91c1c;
                    }

                    .modal-close {
                        position: absolute;
                        top: 16px;
                        right: 16px;
                        background: none;
                        border: none;
                        color: #9ca3af;
                        cursor: pointer;
                        padding: 4px;
                        border-radius: 4px;
                        transition: all 0.2s;
                    }

                    .modal-close:hover {
                        background-color: #f3f4f6;
                        color: #4b5563;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    @keyframes slideIn {
                        from { 
                            opacity: 0;
                            transform: translate(-50%, -40%) scale(0.95);
                        }
                        to { 
                            opacity: 1;
                            transform: translate(-50%, -50%) scale(1);
                        }
                    }
                `}</style>
            </div>
        </>
    );
};

export default ConfirmationModal;
