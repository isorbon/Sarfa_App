import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

import { useCurrency, CurrencyCode } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Lock } from 'lucide-react';
import Layout from '../components/Layout';
import ImageCropperModal from '../components/ImageCropperModal';
import ThemeToggle from '../components/ThemeToggle';
import UserMenu from '../components/UserMenu';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Settings: React.FC = () => {
    const { t } = useLanguage();
    const { user, updateUser, changePassword } = useAuth();
    const { currency, setCurrency } = useCurrency();

    const [name, setName] = useState(user?.name || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI States
    const [isPasswordExpanded, setIsPasswordExpanded] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [loading, setLoading] = useState(false);

    // Cropper State
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: t.settings.passwordMismatch });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: t.settings.passwordMinLength });
            return;
        }

        setLoading(true);
        try {
            await changePassword(newPassword);
            setMessage({ type: 'success', text: t.settings.passwordChanged });
            setNewPassword('');
            setConfirmPassword('');
            setIsPasswordExpanded(false);
        } catch (error) {
            setMessage({ type: 'error', text: t.settings.passwordChangeError });
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImageSrc(reader.result as string);
                setIsCropperOpen(true);
            };
            reader.readAsDataURL(file);
        }
        // Reset file input value to allow selecting the same file again
        e.target.value = '';
    };

    const handleCropComplete = async (croppedImageBlob: Blob) => {
        setIsCropperOpen(false);
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', croppedImageBlob, 'avatar.jpg');
            const res = await authAPI.uploadAvatar(formData);
            setAvatarUrl(res.avatar_url);
            updateUser({ avatar_url: res.avatar_url });
            setMessage({ type: 'success', text: t.settings.avatarUpdated });
            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            console.error(err);
            setMessage({ type: 'error', text: t.settings.avatarUploadError });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <main className="settings-main">
                <header className="settings-header">
                    <div className="header-greeting">
                        <h1>
                            <span className="gradient-text">{t.common.settings}</span>
                        </h1>
                        <p>{t.settings.subtitle}</p>
                    </div>
                    <div className="header-actions">
                        <LanguageSwitcher />
                        <ThemeToggle />
                        <UserMenu />
                    </div>
                </header>

                <div className="settings-content">
                    {message && (
                        <div className={`message ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Profile Section */}
                    <section className="settings-section">
                        <h2>{t.common.profile} {t.common.settings}</h2>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="settings-grid">
                                {/* Avatar */}
                                <div className="form-group avatar-group">
                                    <label className="form-label">{t.settings.avatar}</label>
                                    <div className="avatar-wrapper">
                                        <div
                                            className="current-avatar clickable"
                                            onClick={() => document.getElementById('avatar-upload')?.click()}
                                            title="Click to upload new avatar"
                                        >
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="Avatar" />
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    <User size={40} />
                                                </div>
                                            )}
                                            <div className="avatar-overlay">
                                                <span className="upload-text">{t.settings.upload}</span>
                                            </div>
                                        </div>
                                        <input
                                            type="file"
                                            id="avatar-upload"
                                            className="hidden-input"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                        />
                                        <div className="avatar-info">
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder={t.settings.avatarUrlPlaceholder}
                                                value={avatarUrl}
                                                onChange={(e) => setAvatarUrl(e.target.value)}
                                                onBlur={async () => {
                                                    if (avatarUrl !== user?.avatar_url) {
                                                        setLoading(true);
                                                        try {
                                                            await updateUser({ avatar_url: avatarUrl });
                                                            setMessage({ type: 'success', text: t.settings.avatarUrlSaved });
                                                            setTimeout(() => setMessage(null), 3000);
                                                        } catch (error) {
                                                            setMessage({ type: 'error', text: t.settings.avatarUrlError });
                                                        } finally {
                                                            setLoading(false);
                                                        }
                                                    }
                                                }}
                                            />
                                            <p className="help-text">{t.settings.avatarHelp}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div className="form-group">
                                    <label className="form-label">{t.settings.fullName}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onBlur={async () => {
                                            if (name !== user?.name) {
                                                setLoading(true);
                                                try {
                                                    await updateUser({ name });
                                                    setMessage({ type: 'success', text: t.settings.nameSaved });
                                                    setTimeout(() => setMessage(null), 3000);
                                                } catch (error) {
                                                    setMessage({ type: 'error', text: t.settings.nameError });
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }
                                        }}
                                    />
                                </div>


                                {/* Currency */}
                                <div className="form-group">
                                    <label className="form-label">{t.settings.currency}</label>
                                    <div className="currency-selector">
                                        <select
                                            className="form-select"
                                            value={currency}
                                            onChange={async (e) => {
                                                const newCurrency = e.target.value as CurrencyCode;
                                                setCurrency(newCurrency);
                                                setLoading(true);
                                                try {
                                                    await updateUser({ currency: newCurrency });
                                                    setMessage({ type: 'success', text: t.settings.currencyUpdated });
                                                    setTimeout(() => setMessage(null), 3000);
                                                } catch (error) {
                                                    setMessage({ type: 'error', text: t.settings.currencyError });
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                            style={{ paddingLeft: '1rem' }}
                                        >
                                            <option value="EUR">EUR (€)</option>
                                            <option value="USD">USD ($)</option>
                                            <option value="UAH">UAH (₴)</option>
                                        </select>
                                    </div>
                                    <p className="help-text">
                                        {t.settings.currencyHelp}
                                    </p>
                                </div>
                            </div>
                        </form>
                    </section>

                    {/* Security Section */}
                    <section className="settings-section">
                        <button
                            className="accordion-header"
                            onClick={() => setIsPasswordExpanded(!isPasswordExpanded)}
                        >
                            <div className="header-content">
                                <Lock size={20} />
                                <h2>{t.settings.changePassword}</h2>
                            </div>
                            <span className={`arrow ${isPasswordExpanded ? 'expanded' : ''}`}>▼</span>
                        </button>

                        {isPasswordExpanded && (
                            <form onSubmit={handlePasswordChange} className="accordion-content fade-in">
                                <div className="form-group">
                                    <label className="form-label">{t.settings.newPassword}</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t.settings.repeatPassword}</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {t.settings.updatePassword}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                </div>
            </main>

            <ImageCropperModal
                isOpen={isCropperOpen}
                imageSrc={selectedImageSrc}
                onClose={() => setIsCropperOpen(false)}
                onCropComplete={handleCropComplete}
            />

            <style>{`
                .settings-page {
                    display: flex;
                    min-height: 100vh;
                    background-color: var(--color-bg-primary);
                }

                .settings-main {
                    flex: 1;
                    margin-left: 260px;
                    min-height: 100vh;
                }

                .settings-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--space-6);
                    background-color: var(--color-bg-secondary);
                    border-bottom: 1px solid var(--color-border);
                    margin-bottom: var(--space-8);
                }

                .settings-header h1 {
                    font-size: var(--font-size-2xl);
                    margin-bottom: var(--space-1);
                    color: var(--color-text-primary);
                }

                .settings-header h1 .gradient-text {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .settings-header p {
                    font-size: var(--font-size-sm);
                    color: var(--color-text-secondary);
                    margin: 0;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: var(--space-4);
                }

                .settings-content {
                    max-width: 800px;
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-8);
                    padding: var(--space-6);
                }

                .settings-section {
                    background-color: var(--color-bg-secondary);
                    padding: var(--space-8);
                    border-radius: var(--radius-xl);
                    box-shadow: var(--shadow-sm);
                }

                .settings-section h2 {
                    font-size: var(--font-size-xl);
                    margin-bottom: var(--space-6);
                    color: var(--color-text-primary);
                }

                .settings-grid {
                    display: grid;
                    gap: var(--space-6);
                }

                .avatar-wrapper {
                    display: flex;
                    align-items: center;
                    gap: var(--space-4);
                }

                .current-avatar {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    overflow: hidden;
                    background-color: var(--color-gray-100);
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-gray-400);
                    border: 2px solid var(--color-gray-200);
                    position: relative;
                }

                .current-avatar.clickable {
                    cursor: pointer;
                }
                
                .current-avatar.clickable:hover .avatar-overlay {
                    opacity: 1;
                }

                .avatar-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .upload-text {
                    color: white;
                    font-size: 12px;
                    font-weight: 600;
                }

                .hidden-input {
                    display: none;
                }

                .avatar-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .current-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                /* Theme Toggle Styles removed (global) */

                .currency-selector {
                    position: relative;
                }

                .currency-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--color-gray-500);
                    pointer-events: none;
                }

                .currency-selector select {
                    padding-left: 40px;
                    background-color: var(--color-bg-secondary);
                    color: var(--color-text-primary);
                    border-color: var(--color-border);
                }
                
                .form-input {
                    background-color: var(--color-bg-secondary);
                    color: var(--color-text-primary);
                    border-color: var(--color-border);
                }
                
                .form-label {
                    color: var(--color-text-secondary);
                }

                .help-text {
                    font-size: var(--font-size-xs);
                    color: var(--color-gray-500);
                    margin-top: var(--space-1);
                }

                .accordion-header {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }
                
                .accordion-header h2 {
                    margin: 0;
                    margin-left: var(--space-2);
                    font-size: var(--font-size-lg);
                }

                .header-content {
                    display: flex;
                    align-items: center;
                    color: var(--color-text-primary);
                }

                .arrow {
                    font-size: 12px;
                    transition: transform 0.2s;
                    color: var(--color-text-secondary);
                }

                .arrow.expanded {
                    transform: rotate(180deg);
                }

                .accordion-content {
                    margin-top: var(--space-6);
                    padding-top: var(--space-6);
                    border-top: 1px solid var(--color-border);
                }

                .message {
                    padding: var(--space-4);
                    border-radius: var(--radius-md);
                    font-weight: var(--font-weight-medium);
                }

                .message.success {
                    background-color: #d1fae5;
                    color: #065f46;
                }

                .message.error {
                    background-color: #fee2e2;
                    color: #991b1b;
                }
                
                @media (max-width: 768px) {
                    .settings-main {
                        margin-left: 0;
                        padding: var(--space-4);
                    }
                }
            `}</style>
        </Layout>
    );
};

export default Settings;
