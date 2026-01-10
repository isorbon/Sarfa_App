import React, { useState, useRef, useEffect } from 'react';
import { languages } from '../locales/translations';
import { useLanguage } from '../context/LanguageContext';
import { ChevronDown } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0];

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
    <div className="language-switcher" ref={dropdownRef}>
      <button
        className="language-switcher-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Select Language"
      >
        <img
          src={`https://flagcdn.com/w40/${currentLanguage.countryCode}.png`}
          alt={currentLanguage.name}
          className="language-flag-img"
        />
        <span className="language-code">{currentLanguage.code === 'en-US' || currentLanguage.code === 'en-GB' ? 'EN' : currentLanguage.code.split('-')[0].toUpperCase()}</span>
        <ChevronDown size={14} className={`chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="language-dropdown">
          {languages.map((lang) => {
            return (
              <button
                key={lang.code}
                className={`language-option ${language === lang.code ? 'active' : ''}`}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
              >
                <img
                  src={`https://flagcdn.com/w40/${lang.countryCode}.png`}
                  alt={lang.name}
                  className="language-flag-img"
                />
                <span className="language-name">{lang.name}</span>
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        .language-switcher {
          position: relative;
          z-index: 100;
        }

        .language-switcher-button {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background-color: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          color: var(--color-text-primary);
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
          height: 40px;
        }

        .language-switcher-button:hover {
          background-color: var(--color-bg-tertiary);
          border-color: var(--color-primary-500);
        }

        .language-flag-img {
          width: 20px;
          height: auto;
          border-radius: 2px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .language-code {
          font-size: 0.875rem;
        }

        .chevron {
          transition: transform 0.2s;
          color: var(--color-text-secondary);
        }

        .chevron.open {
          transform: rotate(180deg);
        }

        .language-dropdown {
          position: absolute;
          top: calc(100% + var(--space-2));
          right: 0;
          width: 220px;
          max-height: 400px;
          overflow-y: auto;
          background-color: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          padding: var(--space-1);
          animation: slideDown 0.2s ease-out;
        }

        .language-option {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          width: 100%;
          padding: var(--space-2) var(--space-3);
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          color: var(--color-text-primary);
          border-radius: var(--radius-md);
          transition: all 0.1s;
        }

        .language-option:hover {
          background-color: var(--color-bg-tertiary);
        }

        .language-option.active {
          background-color: var(--color-primary-100);
          color: var(--color-primary-700);
        }

        .dark-mode .language-option.active {
          background-color: var(--color-primary-900);
          color: var(--color-primary-100);
        }

        .language-name {
          font-size: 0.875rem;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LanguageSwitcher;
