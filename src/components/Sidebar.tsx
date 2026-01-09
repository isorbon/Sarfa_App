import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  TrendingUp,
  Target,
  Wallet,
  Settings,
  HelpCircle,
  Headphones,
  LogOut,
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, group: 'general' },
    { path: '/expenses', label: 'All Expenses', icon: Receipt, group: 'general' },
    { path: '/bills', label: 'Bill & Subscription', icon: CreditCard, group: 'general' },
    { path: '/investment', label: 'Investment', icon: TrendingUp, group: 'general' },
    { path: '/card', label: 'Card', icon: Wallet, group: 'general' },
    { path: '/goals', label: 'Goals', icon: Target, group: 'general' },
  ];

  const toolItems = [
    { path: '/analytics', label: 'Analytics', icon: TrendingUp, group: 'tools' },
  ];

  const otherItems = [
    { path: '/settings', label: 'Setting', icon: Settings, group: 'other' },
    { path: '/help', label: 'Help Center', icon: HelpCircle, group: 'other' },
    { path: '/support', label: 'Support', icon: Headphones, group: 'other' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/logo.png" alt="Sarfa" style={{ width: '40px', height: '40px' }} />
          <span className="sidebar-logo-text">SARFA</span>
        </div>
        <p className="sidebar-tagline">Track your all expenses and transactions</p>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <h3 className="sidebar-section-title">General</h3>
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
          <h3 className="sidebar-section-title">Tools</h3>
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

        <div className="sidebar-section">
          <h3 className="sidebar-section-title">Other</h3>
          {otherItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
          <button onClick={logout} className="sidebar-link logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>



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
