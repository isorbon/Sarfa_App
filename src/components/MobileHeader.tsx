import React from 'react';
import { Menu } from 'lucide-react';
import UserMenu from './UserMenu';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
  return (
    <>
      <header className="mobile-header">
        <div className="mobile-left-section">
          <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
            <Menu size={24} />
          </button>

          <div className="mobile-header-logo">
            <img src="/logo.svg" alt="Sarfa" style={{ width: '32px', height: '32px' }} />
            <span className="mobile-logo-text">SARFA</span>
          </div>
        </div>

        <div className="mobile-header-actions">
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
          width: 100%;
          height: 48px;
          background-color: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-gray-200);
          padding: 0 var(--space-3);
          box-sizing: border-box; /* Ensuring padding doesn't increase width */
          align-items: center;
          justify-content: space-between;
          z-index: 99;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        @media (max-width: 768px) {
          .mobile-header {
            display: flex;
          }
        }

        /* grouped left section for menu + logo */
        .mobile-left-section {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .mobile-menu-btn {
          background: none;
          border: none;
          color: var(--color-gray-700);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
        }

        .mobile-header-logo {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .mobile-logo-text {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-bold);
          background: linear-gradient(135deg, var(--color-primary-600), var(--color-blue-500));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .mobile-header-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>
    </>
  );
};

export default MobileHeader;
