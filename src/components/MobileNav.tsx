import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Receipt,
    CreditCard,
    Wallet,
    Settings,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const MobileNav: React.FC = () => {
    const location = useLocation();
    const { t } = useLanguage();

    const navItems = [
        { path: '/', label: t.common.dashboard, icon: LayoutDashboard },
        { path: '/expenses', label: t.common.allExpenses, icon: Receipt },
        { path: '/bills', label: t.common.billsSubscription, icon: CreditCard },
        { path: '/cards', label: t.common.cards, icon: Wallet },
        { path: '/settings', label: t.common.settings, icon: Settings },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            <nav className="mobile-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <style>{`
        .mobile-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: var(--color-bg-secondary);
          border-top: 1px solid var(--color-gray-200);
          padding: var(--space-2) var(--space-2) calc(var(--space-2) + env(safe-area-inset-bottom));
          z-index: 100;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
        }

        @media (max-width: 768px) {
          .mobile-nav {
            display: flex;
            justify-content: space-around;
            align-items: center;
          }
        }

        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: var(--space-2);
          color: var(--color-gray-600);
          text-decoration: none;
          font-size: 11px;
          font-weight: var(--font-weight-medium);
          transition: all var(--transition-fast);
          border-radius: var(--radius-md);
          min-width: 60px;
        }

        .mobile-nav-item span {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mobile-nav-item:hover {
          color: var(--color-primary-600);
        }

        .mobile-nav-item.active {
          color: var(--color-primary-600);
          background-color: var(--color-primary-50);
        }

        .mobile-nav-item.active svg {
          stroke-width: 2.5;
        }
      `}</style>
        </>
    );
};

export default MobileNav;
