import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

const COMMON_ICONS = [
  'ShoppingCart', 'ShoppingBag', 'Film', 'Coffee', 'Utensils', 'UtensilsCrossed',
  'Pizza', 'Beer', 'Candy', 'IceCream', 'Apple', 'Beef',
  'Plane', 'Car', 'Train', 'Bus', 'Bike', 'Ship',
  'Home', 'Building', 'Hotel', 'Store', 'Warehouse', 'School',
  'TrendingUp', 'TrendingDown', 'DollarSign', 'Euro', 'CreditCard', 'BanknoteIcon',
  'Tv', 'Music', 'Gamepad2', 'Book', 'Newspaper', 'Film',
  'Heart', 'Activity', 'Pill', 'Stethoscope', 'Syringe', 'Dumbbell',
  'Smartphone', 'Laptop', 'Watch', 'Headphones', 'Camera', 'Printer',
  'Shirt', 'ShoppingBag', 'Package', 'Gift', 'Tag', 'Sparkles',
  'Zap', 'Wifi', 'Phone', 'Mail', 'MessageCircle', 'Send',
  'Star', 'Heart', 'ThumbsUp', 'Smile', 'Palette', 'Brush',
];

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange }) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredIcons = COMMON_ICONS.filter(icon =>
    icon.toLowerCase().includes(search.toLowerCase())
  );

  const SelectedIcon = (LucideIcons as any)[value] || LucideIcons.ShoppingCart;

  return (
    <div className="icon-picker">
      <button
        type="button"
        className="icon-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <SelectedIcon size={24} />
        <span>{value}</span>
      </button>

      {isOpen && (
        <>
          <div className="icon-picker-backdrop" onClick={() => setIsOpen(false)} />
          <div className="icon-picker-dropdown">
            <div className="icon-picker-header">
              <input
                type="text"
                className="icon-picker-search"
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="icon-picker-grid">
              {filteredIcons.map((iconName) => {
                const Icon = (LucideIcons as any)[iconName];
                if (!Icon) return null;

                return (
                  <button
                    key={iconName}
                    type="button"
                    className={`icon-picker-item ${value === iconName ? 'active' : ''}`}
                    onClick={() => {
                      onChange(iconName);
                      setIsOpen(false);
                    }}
                    title={iconName}
                  >
                    <Icon size={24} />
                  </button>
                );
              })}
            </div>
            {filteredIcons.length === 0 && (
              <div className="icon-picker-empty">No icons found</div>
            )}
          </div>
        </>
      )}

      <style>{`
        .icon-picker {
          position: relative;
        }

        .icon-picker-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background-color: var(--color-bg-secondary);
          color: var(--color-text-primary);
          font-size: var(--font-size-base);
          font-family: var(--font-family);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .icon-picker-trigger:hover {
          border-color: var(--color-primary-500);
        }

        .icon-picker-trigger:focus {
          outline: none;
          border-color: var(--color-primary-500);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .icon-picker-backdrop {
          position: fixed;
          inset: 0;
          z-index: var(--z-dropdown);
        }

        .icon-picker-dropdown {
          position: absolute;
          top: calc(100% + var(--space-2));
          left: 0;
          width: 100%;
          min-width: 300px;
          max-height: 400px;
          background-color: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          z-index: calc(var(--z-dropdown) + 1);
          display: flex;
          flex-direction: column;
        }

        .icon-picker-header {
          padding: var(--space-4);
          border-bottom: 1px solid var(--color-border);
        }

        .icon-picker-search {
          width: 100%;
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
          font-family: var(--font-family);
          background-color: var(--color-bg-secondary);
          color: var(--color-text-primary);
        }

        .icon-picker-search:focus {
          outline: none;
          border-color: var(--color-primary-500);
        }

        .icon-picker-grid {
          padding: var(--space-4);
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
          gap: var(--space-2);
          overflow-y: auto;
          max-height: 320px;
        }

        .icon-picker-item {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background-color: var(--color-bg-secondary);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .icon-picker-item:hover {
          border-color: var(--color-primary-500);
          background-color: var(--color-primary-50);
          color: var(--color-primary-600);
        }

        .dark-mode .icon-picker-item:hover {
          background-color: rgba(139, 92, 246, 0.15);
          color: var(--color-primary-400);
        }

        .icon-picker-item.active {
          border-color: var(--color-primary-600);
          background-color: var(--color-primary-100);
          color: var(--color-primary-600);
        }

        .dark-mode .icon-picker-item.active {
          background-color: rgba(139, 92, 246, 0.25);
          color: var(--color-primary-400);
        }

        .icon-picker-empty {
          padding: var(--space-8);
          text-align: center;
          color: var(--color-text-secondary);
          font-size: var(--font-size-sm);
        }
      `}</style>
    </div>
  );
};

export default IconPicker;
