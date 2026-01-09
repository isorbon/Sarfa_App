import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token.' });
        }
        req.user = user;
        next();
    });
};

// Helper function to promisify db operations
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await dbRun(
            'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
            [email, hashedPassword, name]
        );

        // Generate token
        const token = jwt.sign({ id: result.lastID, email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: { id: result.lastID, email, name }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Categories Routes
app.get('/api/categories', authenticateToken, async (req, res) => {
    try {
        const categories = await dbAll('SELECT * FROM categories');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Expenses Routes
app.get('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const { startDate, endDate, category } = req.query;
        let sql = 'SELECT * FROM expenses WHERE user_id = ?';
        const params = [req.user.id];

        if (startDate && endDate) {
            sql += ' AND date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        if (category) {
            sql += ' AND category = ?';
            params.push(category);
        }

        sql += ' ORDER BY date DESC';

        const expenses = await dbAll(sql, params);
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
    try {
        const { amount, category, sub_category, description, icon, date, mode } = req.body;

        if (!amount || !category || !date || !mode) {
            return res.status(400).json({ error: 'Amount, category, date, and mode are required' });
        }

        const result = await dbRun(
            'INSERT INTO expenses (user_id, amount, category, sub_category, description, icon, date, mode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, amount, category, sub_category, description, icon || 'ShoppingCart', date, mode]
        );

        const newExpense = await dbGet('SELECT * FROM expenses WHERE id = ?', [result.lastID]);
        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/expenses/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, category, sub_category, description, icon, date, mode } = req.body;

        // Verify expense belongs to user
        const expense = await dbGet('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        await dbRun(
            'UPDATE expenses SET amount = ?, category = ?, sub_category = ?, description = ?, icon = ?, date = ?, mode = ? WHERE id = ?',
            [amount, category, sub_category, description, icon, date, mode, id]
        );

        const updatedExpense = await dbGet('SELECT * FROM expenses WHERE id = ?', [id]);
        res.json(updatedExpense);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify expense belongs to user
        const expense = await dbGet('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        await dbRun('DELETE FROM expenses WHERE id = ?', [id]);
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Dashboard Stats
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        const { period = 'recent' } = req.query;
        const userId = req.user.id;

        // Calculate date range based on period
        let startDate, endDate;
        const now = new Date();

        if (period === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        } else if (period === 'year') {
            startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
            endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
        } else {
            // Recent: last 30 days
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            endDate = now.toISOString().split('T')[0];
        }

        // Get total expenses
        const totalResult = await dbGet(
            'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ?',
            [userId, startDate, endDate]
        );

        // Get monthly expenses (current month)
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const monthlyResult = await dbGet(
            'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ?',
            [userId, monthStart, monthEnd]
        );

        // Get category breakdown
        const categoryBreakdown = await dbAll(
            `SELECT category, SUM(amount) as total 
       FROM expenses 
       WHERE user_id = ? AND date BETWEEN ? AND ? 
       GROUP BY category 
       ORDER BY total DESC`,
            [userId, startDate, endDate]
        );

        // Get monthly trend (last 6 months)
        const monthlyTrend = [];
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStartDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString().split('T')[0];
            const monthEndDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).toISOString().split('T')[0];

            const result = await dbGet(
                'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ?',
                [userId, monthStartDate, monthEndDate]
            );

            monthlyTrend.push({
                month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
                total: result?.total || 0
            });
        }

        // Get investment total
        const investmentResult = await dbGet(
            'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND category = ?',
            [userId, 'Investment']
        );

        // Get Bill & Subscription items
        const subscriptions = await dbAll(
            `SELECT * FROM expenses 
       WHERE user_id = ? AND category = 'Bill & Subscription' 
       ORDER BY date DESC 
       LIMIT 5`,
            [userId]
        );

        res.json({
            totalExpenses: totalResult?.total || 0,
            monthlyExpenses: monthlyResult?.total || 0,
            totalInvestment: investmentResult?.total || 0,
            accountBalance: 898450, // This would be calculated based on income - expenses
            goal: { name: 'Apple iPhone 17 Pro', required: 145000, collected: 75000 },
            categoryBreakdown,
            monthlyTrend,
            subscriptions
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Bills & Subscription Routes
app.get('/api/bills', authenticateToken, async (req, res) => {
    try {
        const { search, startDate, endDate } = req.query;
        const userId = req.user.id;

        let sql = `SELECT * FROM expenses WHERE user_id = ? AND category = 'Bill & Subscription'`;
        const params = [userId];

        if (startDate && endDate) {
            sql += ' AND date BETWEEN ? AND ?';
            params.push(startDate, endDate);
        }

        if (search) {
            sql += ' AND (sub_category LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        sql += ' ORDER BY date DESC';

        const bills = await dbAll(sql, params);

        // Calculate statistics
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const monthlyTotal = await dbGet(
            `SELECT SUM(amount) as total FROM expenses 
             WHERE user_id = ? AND category = 'Bill & Subscription' 
             AND date BETWEEN ? AND ?`,
            [userId, monthStart, monthEnd]
        );

        const upcomingBills = bills.filter(bill => {
            const billDate = new Date(bill.date);
            const daysUntil = Math.ceil((billDate - now) / (1000 * 60 * 60 * 24));
            return daysUntil >= 0 && daysUntil <= 7;
        });

        const overdueBills = bills.filter(bill => {
            const billDate = new Date(bill.date);
            return billDate < now;
        });

        res.json({
            bills,
            stats: {
                totalMonthly: monthlyTotal?.total || 0,
                upcomingCount: upcomingBills.length,
                overdueCount: overdueBills.length,
                totalBills: bills.length
            }
        });
    } catch (error) {
        console.error('Error fetching bills:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
