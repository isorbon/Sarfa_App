import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new sqlite3.Database(join(__dirname, 'expenses.db'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add new columns to users table if they don't exist
    const userColumns = ['avatar_url TEXT', 'currency TEXT DEFAULT "EUR"', 'theme TEXT DEFAULT "light"'];
    userColumns.forEach(column => {
      const columnName = column.split(' ')[0];
      db.run(`ALTER TABLE users ADD COLUMN ${column}`, (err) => {
        // Ignore error if column already exists
        if (err && !err.message.includes('duplicate column name')) {
          console.error(`Error adding column ${columnName}:`, err);
        }
      });
    });

    // Create expenses table
    db.run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        sub_category TEXT,
        description TEXT,
        icon TEXT DEFAULT 'ShoppingCart',
        date DATE NOT NULL,
        mode TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Create categories table
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        color TEXT NOT NULL,
        icon TEXT NOT NULL
      )
    `);

    // Insert default categories
    const categories = [
      { name: 'Food & Grocery', color: '#10B981', icon: 'ShoppingBag' },
      { name: 'Investment', color: '#8B5CF6', icon: 'TrendingUp' },
      { name: 'Shopping', color: '#F59E0B', icon: 'ShoppingCart' },
      { name: 'Travelling', color: '#3B82F6', icon: 'Plane' },
      { name: 'Miscellaneous', color: '#F97316', icon: 'Package' },
      { name: 'Bill & Subscription', color: '#06B6D4', icon: 'CreditCard' }
    ];

    const insertCategory = db.prepare(`
      INSERT OR IGNORE INTO categories (name, color, icon) VALUES (?, ?, ?)
    `);

    categories.forEach(cat => {
      insertCategory.run(cat.name, cat.color, cat.icon);
    });

    insertCategory.finalize();

    // Create demo user
    const demoEmail = 'demo@expenses.com';
    const demoPassword = 'demo123';

    db.get('SELECT id FROM users WHERE email = ?', [demoEmail], (err, row) => {
      if (!row) {
        bcrypt.hash(demoPassword, 10, (err, hash) => {
          if (err) {
            console.error('Error hashing password:', err);
            return;
          }

          db.run(
            'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
            [demoEmail, hash, 'Demo User'],
            function (err) {
              if (err) {
                console.error('Error creating demo user:', err);
              } else {
                console.log('Demo user created successfully');
                createDemoExpenses(this.lastID);
              }
            }
          );
        });
      }
    });
  });
}

function createDemoExpenses(userId) {
  const demoExpenses = [
    { amount: 2100, category: 'Shopping', sub_category: 'Amazon', description: 'Monthly shopping', icon: 'ShoppingBag', date: '2025-05-31', mode: 'UPI' },
    { amount: 299, category: 'Movie', sub_category: 'PVR', description: 'Avengers movie', icon: 'Film', date: '2025-05-28', mode: 'UPI' },
    { amount: 5000, category: 'Investment', sub_category: 'Grow', description: 'Monthly investment', icon: 'TrendingUp', date: '2025-05-24', mode: 'Bank' },
    { amount: 2460, category: 'Travel', sub_category: 'IRCTC', description: 'Train tickets', icon: 'Train', date: '2025-05-20', mode: 'Card' },
    { amount: 678, category: 'Food', sub_category: 'Swiggy', description: 'Food delivery', icon: 'UtensilsCrossed', date: '2025-05-15', mode: 'UPI' },
    { amount: 149, category: 'Bill & Subscription', sub_category: 'Netflix', description: 'Monthly subscription', icon: 'Tv', date: '2025-06-01', mode: 'Card' },
    { amount: 49, category: 'Bill & Subscription', sub_category: 'Spotify', description: 'Music streaming', icon: 'Music', date: '2025-08-02', mode: 'UPI' },
    { amount: 3999, category: 'Bill & Subscription', sub_category: 'Figma', description: 'Annual plan', icon: 'Palette', date: '2025-06-27', mode: 'Card' },
    { amount: 399, category: 'Bill & Subscription', sub_category: 'WiFi', description: 'Internet bill', icon: 'Wifi', date: '2025-06-01', mode: 'UPI' },
    { amount: 1265, category: 'Bill & Subscription', sub_category: 'Electricity', description: 'Power bill', icon: 'Zap', date: '2025-06-01', mode: 'Bank' }
  ];

  const insertExpense = db.prepare(`
    INSERT INTO expenses (user_id, amount, category, sub_category, description, icon, date, mode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  demoExpenses.forEach(expense => {
    insertExpense.run(
      userId,
      expense.amount,
      expense.category,
      expense.sub_category,
      expense.description,
      expense.icon,
      expense.date,
      expense.mode
    );
  });

  insertExpense.finalize(() => {
    console.log('Demo expenses created successfully');
  });
}

export default db;
