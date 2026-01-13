import sqlite3 from 'sqlite3';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv'; // Ensure dotenv is available

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isPostgres = !!process.env.DATABASE_URL;

let db;

if (isPostgres) {
    console.log('Connecting to PostgreSQL/Supabase...');
    const { Pool } = pg;
    db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Required for Supabase in many environments
    });
} else {
    console.log('Connecting to local SQLite...');
    const dbPath = process.env.DB_PATH || join(__dirname, 'expenses.db');
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) console.error('Error opening SQLite DB:', err);
        else console.log('Connected to SQLite');
    });
}

// Database helper methods to normalize SQLite vs Postgres differences
const query = (text, params = []) => {
    if (isPostgres) {
        // Convert ? to $1, $2, etc. for Postgres
        let pCount = 1;
        const pgText = text.replace(/\?/g, () => `$${pCount++}`);
        return db.query(pgText, params);
    } else {
        // SQLite: run() for INSERT/UPDATE/DELETE, all() for SELECT
        return new Promise((resolve, reject) => {
            const isSelect = text.trim().toLowerCase().startsWith('select');
            if (isSelect) {
                db.all(text, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve({ rows, rowCount: rows.length });
                });
            } else {
                db.run(text, params, function (err) {
                    if (err) reject(err);
                    else resolve({ lastID: this.lastID, changes: this.changes });
                });
            }
        });
    }
};

const get = async (text, params = []) => {
    if (isPostgres) {
        const res = await query(text, params);
        return res.rows[0];
    } else {
        return new Promise((resolve, reject) => {
            db.get(text, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
};

const all = async (text, params = []) => {
    if (isPostgres) {
        const res = await query(text, params);
        return res.rows;
    } else {
        return new Promise((resolve, reject) => {
            db.all(text, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

const run = async (text, params = []) => {
    // Unified run command
    return query(text, params);
};

// Initialize Database Schema (Tables)
const initializeDatabase = async () => {
    console.log('Initializing database schema...');

    const userTable = `
    CREATE TABLE IF NOT EXISTS users (
      id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      avatar_url TEXT,
      currency TEXT DEFAULT 'EUR',
      theme TEXT DEFAULT 'light',
      created_at ${isPostgres ? 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
    );
  `;

    const expenseTable = `
    CREATE TABLE IF NOT EXISTS expenses (
      id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      sub_category TEXT,
      description TEXT,
      icon TEXT DEFAULT 'ShoppingCart',
      date DATE NOT NULL,
      mode TEXT NOT NULL,
      card_id INTEGER, 
      created_at ${isPostgres ? 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
    );
  `;

    const categoriesTable = `
    CREATE TABLE IF NOT EXISTS categories (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        color TEXT NOT NULL,
        icon TEXT NOT NULL
    );
  `;

    const cardsTable = `
    CREATE TABLE IF NOT EXISTS cards (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        bank TEXT NOT NULL,
        card_type TEXT DEFAULT 'generic',
        created_at ${isPostgres ? 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
    );
  `;

    const goalsTable = `
    CREATE TABLE IF NOT EXISTS goals (
        id ${isPostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_amount REAL DEFAULT 0,
        deadline DATE,
        color TEXT DEFAULT '#3B82F6',
        icon TEXT DEFAULT 'Target',
        created_at ${isPostgres ? 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' : 'DATETIME DEFAULT CURRENT_TIMESTAMP'}
    );
  `;

    try {
        await run(userTable);
        await run(expenseTable);
        await run(categoriesTable);
        await run(cardsTable);
        await run(goalsTable);

        // Initialize default categories if empty
        const countRes = await get('SELECT COUNT(*) as count FROM categories');
        const count = isPostgres ? parseInt(countRes.count) : countRes.count;

        if (count === 0) {
            console.log('Seeding categories...');
            const categories = [
                { name: 'Food & Grocery', color: '#10B981', icon: 'ShoppingBag' },
                { name: 'Investment', color: '#8B5CF6', icon: 'TrendingUp' },
                { name: 'Shopping', color: '#F59E0B', icon: 'ShoppingCart' },
                { name: 'Travelling', color: '#3B82F6', icon: 'Plane' },
                { name: 'Miscellaneous', color: '#F97316', icon: 'Package' },
                { name: 'Bill & Subscription', color: '#06B6D4', icon: 'CreditCard' }
            ];

            for (const cat of categories) {
                await run('INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)', [cat.name, cat.color, cat.icon]);
            }
        }

        console.log('Database schema initialized.');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
};

// Auto-init on start
initializeDatabase();

export { db, query, get, all, run, isPostgres };
