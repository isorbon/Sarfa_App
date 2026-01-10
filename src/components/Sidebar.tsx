import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  TrendingUp,
  Target,
  Wallet,
} from 'lucide-react';

import { useLanguage } from '../context/LanguageContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: '/', label: t.common.dashboard, icon: LayoutDashboard, group: 'general' },
    { path: '/expenses', label: t.common.allExpenses, icon: Receipt, group: 'general' },
    { path: '/bills', label: t.common.billsSubscription, icon: CreditCard, group: 'general' },
    { path: '/cards', label: t.common.cards, icon: Wallet, group: 'general' },
    { path: '/investment', label: t.common.investment, icon: TrendingUp, group: 'general' },
    { path: '/goals', label: t.common.goals, icon: Target, group: 'general' },
  ];

  const toolItems = [
    { path: '/analytics', label: t.common.analytics, icon: TrendingUp, group: 'tools' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/logo.png" alt="Sarfa" style={{ width: '40px', height: '40px' }} />
          <span className="sidebar-logo-text">SARFA</span>
        </div>
        <p className="sidebar-tagline">{t.common.trackTagline}</p>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">{t.common.general}</h3>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-section-title">{t.common.tools}</h3>
          {toolItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

      </nav>

      <div className="sidebar-footer">
        <p className="app-version">v1.2.0</p>
        <p className="app-copyright">&copy; 2026 Sarfa. All rights reserved.</p>
      </div>



      <style>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          background-color: var(--color-bg-secondary);
          border-right: 1px solid var(--color-gray-200);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          overflow-y: auto;
        }

        .sidebar-header {
          padding: var(--space-6);
          border-bottom: 1px solid var(--color-gray-200);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-3);
        }

        .sidebar-logo-text {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-bold);
          background: linear-gradient(135deg, var(--color-primary-600), var(--color-blue-500));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sidebar-tagline {
          font-size: var(--font-size-xs);
          color: var(--color-gray-500);
          margin: 0;
        }

        .sidebar-nav {
          flex: 1;
          padding: var(--space-4);
          overflow-y: auto;
        }

        .sidebar-section {
          margin-bottom: var(--space-6);
        }

        .sidebar-section-title {
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          color: var(--color-gray-400);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: var(--space-3);
          padding: 0 var(--space-3);
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          color: var(--color-gray-700);
          text-decoration: none;
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          margin-bottom: var(--space-1);
          transition: all var(--transition-fast);
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-family: var(--font-family);
        }

        .sidebar-link:hover {
          background-color: var(--color-gray-100);
          color: var(--color-gray-900);
        }

        .sidebar-link.active {
          background: linear-gradient(135deg, var(--color-primary-600), var(--color-blue-500));
          color: white;
        }

        .sidebar-link.active:hover {
          background: linear-gradient(135deg, var(--color-primary-700), var(--color-blue-600));
        }

        .logout-btn {
          color: var(--color-error);
        }

        .logout-btn:hover {
          background-color: #fee2e2;
          color: var(--color-error);
        }

        .sidebar-footer {
          padding: var(--space-6);
          border-top: 1px solid var(--color-gray-200);
          text-align: center;
          margin-top: auto;
        }

        .app-version {
          font-size: var(--font-size-xs);
          color: var(--color-gray-500);
          margin-bottom: var(--space-1);
          font-weight: var(--font-weight-medium);
        }

        .app-copyright {
          font-size: 10px;
          color: var(--color-gray-400);
          margin: 0;
        }



        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
            transition: transform var(--transition-base);
          }

          .sidebar.open {
            transform: translateX(0);
            z-index: var(--z-modal);
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
