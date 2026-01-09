import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, HelpCircle, Headphones, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="user-menu-container" ref={dropdownRef}>
      <button className="user-avatar-btn" onClick={toggleDropdown}>
        <div className="user-avatar">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            user?.name?.charAt(0).toUpperCase() || <User size={20} />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-email">{user?.email}</div>
          </div>

          <div className="dropdown-divider" />

          <nav className="dropdown-nav">
            <Link to="/settings" className="dropdown-item" onClick={() => setIsOpen(false)}>
              <Settings size={18} />
              <span>Settings</span>
            </Link>
            <Link to="/help" className="dropdown-item" onClick={() => setIsOpen(false)}>
              <HelpCircle size={18} />
              <span>Help Center</span>
            </Link>
            <Link to="/support" className="dropdown-item" onClick={() => setIsOpen(false)}>
              <Headphones size={18} />
              <span>Support</span>
            </Link>

            <div className="dropdown-divider" />

            <button onClick={() => { logout(); setIsOpen(false); }} className="dropdown-item logout">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}

      <style>{`
        .user-menu-container {
          position: relative;
        }

        .user-avatar-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .user-avatar-btn:hover {
          transform: scale(1.05);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary-600), var(--color-blue-500));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 240px;
          background: var(--color-bg-secondary);
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border: 1px solid var(--color-border);
          overflow: hidden;
          z-index: 100;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-header {
          padding: 16px;
          background-color: var(--color-bg-primary);
        }

        .user-name {
          font-weight: 600;
          color: var(--color-text-primary);
          font-size: 14px;
        }

        .user-email {
          color: var(--color-text-secondary);
          font-size: 12px;
          margin-top: 2px;
        }

        .dropdown-divider {
          height: 1px;
          background-color: var(--color-border);
        }

        .dropdown-nav {
          padding: 8px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          color: var(--color-text-primary);
          text-decoration: none;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }

        .dropdown-item:hover {
          background-color: var(--color-bg-primary);
          color: var(--color-text-primary);
        }

        .dropdown-item.logout {
          color: var(--color-error);
        }

        .dropdown-item.logout:hover {
          background-color: #fee2e2;
          color: var(--color-error);
        }
      `}</style>
    </div>
  );
};

export default UserMenu;
