import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useCurrency, CurrencyCode } from '../context/CurrencyContext';
import { User, Moon, Sun, Lock } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ImageCropperModal from '../components/ImageCropperModal';

const Settings: React.FC = () => {
    const { user, updateUser, changePassword } = useAuth();
    const { theme, toggleTheme } = useTheme();
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
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
            return;
        }

        setLoading(true);
        try {
            await changePassword(newPassword);
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setNewPassword('');
            setConfirmPassword('');
            setIsPasswordExpanded(false);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to change password.' });
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
            setMessage({ type: 'success', text: 'Avatar updated!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to upload image' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-page">
            <Sidebar />
            <main className="settings-main">
                <header className="settings-header">
                    <h1>Settings</h1>
                    <p>Manage your account preferences and settings</p>
                </header>

                <div className="settings-content">
                    {message && (
                        <div className={`message ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Profile Section */}
                    <section className="settings-section">
                        <h2>Profile Settings</h2>
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="settings-grid">
                                {/* Avatar */}
                                <div className="form-group avatar-group">
                                    <label className="form-label">Avatar</label>
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
                                                <span className="upload-text">Upload</span>
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
                                                placeholder="Or enter Avatar URL"
                                                value={avatarUrl}
                                                onChange={(e) => setAvatarUrl(e.target.value)}
                                                onBlur={async () => {
                                                    if (avatarUrl !== user?.avatar_url) {
                                                        setLoading(true);
                                                        try {
                                                            await updateUser({ avatar_url: avatarUrl });
                                                            setMessage({ type: 'success', text: 'Avatar URL saved!' });
                                                            setTimeout(() => setMessage(null), 3000);
                                                        } catch (error) {
                                                            setMessage({ type: 'error', text: 'Failed to save avatar URL' });
                                                        } finally {
                                                            setLoading(false);
                                                        }
                                                    }
                                                }}
                                            />
                                            <p className="help-text">Click image to upload or paste a URL</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
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
                                                    setMessage({ type: 'success', text: 'Name saved!' });
                                                    setTimeout(() => setMessage(null), 3000);
                                                } catch (error) {
                                                    setMessage({ type: 'error', text: 'Failed to save name' });
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }
                                        }}
                                    />
                                </div>

                                {/* App Appearance */}
                                <div className="form-group">
                                    <label className="form-label">App Appearance</label>
                                    <button
                                        type="button"
                                        className={`theme-toggle ${theme}`}
                                        onClick={async () => {
                                            toggleTheme();
                                            const newTheme = theme === 'light' ? 'dark' : 'light';
                                            updateUser({ theme: newTheme });
                                        }}
                                    >
                                        <div className="toggle-track">
                                            <div className="toggle-thumb">
                                                {theme === 'light' ? <Sun size={14} /> : <Moon size={14} />}
                                            </div>
                                        </div>
                                        <span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                                    </button>
                                </div>

                                {/* Currency */}
                                <div className="form-group">
                                    <label className="form-label">Currency</label>
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
                                                    setMessage({ type: 'success', text: 'Currency updated!' });
                                                    setTimeout(() => setMessage(null), 3000);
                                                } catch (error) {
                                                    setMessage({ type: 'error', text: 'Failed to update currency' });
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
                                        Exchange rates are fetched from Wise.
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
                                <h2>Change Password</h2>
                            </div>
                            <span className={`arrow ${isPasswordExpanded ? 'expanded' : ''}`}>▼</span>
                        </button>

                        {isPasswordExpanded && (
                            <form onSubmit={handlePasswordChange} className="accordion-content fade-in">
                                <div className="form-group">
                                    <label className="form-label">New Password</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Repeat New Password</label>
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
                                        Update Password
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
                    padding: var(--space-8);
                }

                .settings-header {
                    margin-bottom: var(--space-8);
                }

                .settings-header h1 {
                    color: var(--color-text-primary);
                }

                .settings-content {
                    max-width: 800px;
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-8);
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

                .theme-toggle {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: var(--font-size-base);
                    color: var(--color-text-primary);
                }

                .toggle-track {
                    width: 48px;
                    height: 24px;
                    background-color: var(--color-gray-200);
                    border-radius: 12px;
                    position: relative;
                    transition: background-color 0.2s;
                }

                .theme-toggle.dark .toggle-track {
                    background-color: var(--color-primary-600);
                }

                .toggle-thumb {
                    width: 20px;
                    height: 20px;
                    background-color: white;
                    border-radius: 50%;
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    transition: transform 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-gray-600);
                }

                .theme-toggle.dark .toggle-thumb {
                    transform: translateX(24px);
                    color: var(--color-primary-600);
                }

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
        </div>
    );
};

export default Settings;
