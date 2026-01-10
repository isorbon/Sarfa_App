import React from 'react';
import { Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import LanguageSwitcher from './LanguageSwitcher';

interface MobileHeaderProps {
    onMenuClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
    return (
        <>
            <header className="mobile-header">
                <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
                    <Menu size={24} />
                </button>

                <div className="mobile-header-logo">
                    <img src="/logo.png" alt="Sarfa" style={{ width: '32px', height: '32px' }} />
                    <span className="mobile-logo-text">SARFA</span>
                </div>

                <div className="mobile-header-actions">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <UserMenu />
                </div>
            </header>

            <style>{`
        .mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 56px;
          background-color: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-gray-200);
          padding: var(--space-3) var(--space-4);
          align-items: center;
          justify-content: space-between;
          z-index: 99;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        @media (max-width: 768px) {
          .mobile-header {
            display: flex;
          }
        }

        .mobile-menu-btn {
          background: none;
          border: none;
          color: var(--color-gray-700);
          cursor: pointer;
          padding: var(--space-2);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .mobile-menu-btn:hover {
          background-color: var(--color-gray-100);
        }

        .mobile-header-logo {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .mobile-logo-text {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-bold);
          background: linear-gradient(135deg, var(--color-primary-600), var(--color-blue-500));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .mobile-header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
      `}</style>
        </>
    );
};

export default MobileHeader;
