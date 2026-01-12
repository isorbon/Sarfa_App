import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatar_url: user.avatar_url,
                currency: user.currency,
                theme: user.theme
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { name, avatar_url, currency, theme } = req.body;
        const userId = req.user.id;

        await dbRun(
            'UPDATE users SET name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url), currency = COALESCE(?, currency), theme = COALESCE(?, theme) WHERE id = ?',
            [name, avatar_url, currency, theme, userId]
        );

        const updatedUser = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);

        res.json({
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            avatar_url: updatedUser.avatar_url,
            currency: updatedUser.currency,
            theme: updatedUser.theme
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Server error during profile update' });
    }
});

app.put('/api/auth/password', authenticateToken, async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.user.id;

        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await dbRun('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ error: 'Server error during password update' });
    }
});

app.post('/api/auth/upload-avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user.id;
        // Construct full URL
        const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        await dbRun('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, userId]);

        res.json({ avatar_url: avatarUrl });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ error: 'Server error during avatar upload' });
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
        const { amount, category, sub_category, description, icon, date, mode, card_id } = req.body;

        if (!amount || !category || !date || !mode) {
            return res.status(400).json({ error: 'Amount, category, date, and mode are required' });
        }

        const result = await dbRun(
            'INSERT INTO expenses (user_id, amount, category, sub_category, description, icon, date, mode, card_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, amount, category, sub_category, description, icon || 'ShoppingCart', date, mode, card_id || null]
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
        const { amount, category, sub_category, description, icon, date, mode, card_id } = req.body;

        // Verify expense belongs to user
        const expense = await dbGet('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        await dbRun(
            'UPDATE expenses SET amount = ?, category = ?, sub_category = ?, description = ?, icon = ?, date = ?, mode = ?, card_id = ? WHERE id = ?',
            [amount, category, sub_category, description, icon, date, mode, card_id || null, id]
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
        const { monthlyPeriod = '3months', categoryPeriod = '3months' } = req.query;
        const userId = req.user.id;
        const now = new Date();

        // Helper for local date string YYYY-MM-DD
        const formatDate = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // 1. Calculate Summary Stats (Always based on 'month' or 'recent' context? Or fixed?)
        // Let's keep summary (Total/Monthly expenses) based on current month/total context regardless of filters

        // Get total expenses (All time)
        const totalResult = await dbGet(
            'SELECT SUM(amount) as total FROM expenses WHERE user_id = ?',
            [userId]
        );

        // Get monthly expenses (Current Month)
        const currentMonthStart = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
        const currentMonthEnd = formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));

        const monthlyResult = await dbGet(
            'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ?',
            [userId, currentMonthStart, currentMonthEnd]
        );

        // 2. Calculate Category Breakdown based on categoryPeriod
        let catStartDate, catEndDate;
        if (categoryPeriod === 'month') {
            catStartDate = currentMonthStart;
            catEndDate = currentMonthEnd;
        } else if (categoryPeriod === 'year') {
            catStartDate = formatDate(new Date(now.getFullYear(), 0, 1));
            catEndDate = formatDate(new Date(now.getFullYear(), 11, 31));
        } else if (categoryPeriod === 'lastYear') {
            catStartDate = formatDate(new Date(now.getFullYear() - 1, 0, 1));
            catEndDate = formatDate(new Date(now.getFullYear() - 1, 11, 31));
        } else if (categoryPeriod === '6months') {
            const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
            catStartDate = formatDate(startDate);
            catEndDate = formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        } else {
            // 3months (Default)
            const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            catStartDate = formatDate(startDate);
            catEndDate = formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        }

        const categoryBreakdown = await dbAll(
            `SELECT category, SUM(amount) as total 
       FROM expenses 
       WHERE user_id = ? AND date BETWEEN ? AND ? 
       GROUP BY category 
       ORDER BY total DESC`,
            [userId, catStartDate, catEndDate]
        );

        // 3. Calculate Trend based on monthlyPeriod
        const monthlyTrend = [];

        if (monthlyPeriod === 'year') {
            // 12 Months of current year
            for (let i = 0; i < 12; i++) {
                const monthDate = new Date(now.getFullYear(), i, 1);
                const mStart = formatDate(new Date(now.getFullYear(), i, 1));
                const mEnd = formatDate(new Date(now.getFullYear(), i + 1, 0));

                const result = await dbGet(
                    'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ?',
                    [userId, mStart, mEnd]
                );

                monthlyTrend.push({
                    label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
                    total: result?.total || 0
                });
            }

        } else if (monthlyPeriod === 'lastYear') {
            // 12 Months of LAST year
            const lastYear = now.getFullYear() - 1;
            for (let i = 0; i < 12; i++) {
                const monthDate = new Date(lastYear, i, 1);
                const mStart = formatDate(new Date(lastYear, i, 1));
                const mEnd = formatDate(new Date(lastYear, i + 1, 0));

                const result = await dbGet(
                    'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ?',
                    [userId, mStart, mEnd]
                );

                monthlyTrend.push({
                    label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
                    total: result?.total || 0
                });
            }
        } else if (monthlyPeriod === 'month') {
            // Days of current month
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const dayDate = new Date(now.getFullYear(), now.getMonth(), i);
                const dayStr = formatDate(dayDate);

                const result = await dbGet(
                    'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND date = ?',
                    [userId, dayStr]
                );

                monthlyTrend.push({
                    label: `${i}`,
                    total: result?.total || 0
                });
            }
        } else {
            // 3months or 6months
            const monthsBack = monthlyPeriod === '6months' ? 5 : 2;

            for (let i = monthsBack; i >= 0; i--) {
                const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const mStart = formatDate(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
                const mEnd = formatDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0));

                const result = await dbGet(
                    'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ?',
                    [userId, mStart, mEnd]
                );

                monthlyTrend.push({
                    label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
                    total: result?.total || 0
                });
            }
        }

        // Get investment total
        const investmentResult = await dbGet(
            'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND category = ?',
            [userId, 'Investment']
        );

        // Get primary goal
        const goalResult = await dbGet(
            'SELECT name, target_amount, current_amount FROM goals WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            [userId]
        );

        // Get Bill & Subscription items
        const subscriptions = await dbAll(
            `SELECT * FROM expenses 
       WHERE user_id = ? AND category = 'Bill & Subscription' 
       ORDER BY date DESC`,
            [userId]
        );

        res.json({
            totalExpenses: totalResult?.total || 0,
            monthlyExpenses: monthlyResult?.total || 0,
            totalInvestment: investmentResult?.total || 0,
            accountBalance: 898450,
            goal: goalResult ? {
                name: goalResult.name,
                required: goalResult.target_amount,
                collected: goalResult.current_amount
            } : { name: 'No Goal Set', required: 0, collected: 0 },
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

// Cards Routes
// Get all cards for authenticated user
app.get('/api/cards', authenticateToken, (req, res) => {
    db.all(
        'SELECT * FROM cards WHERE user_id = ? ORDER BY created_at DESC',
        [req.user.id],
        (err, cards) => {
            if (err) {
                console.error('Error fetching cards:', err);
                return res.status(500).json({ error: 'Server error' });
            }
            res.json(cards);
        }
    );
});

// Create new card
app.post('/api/cards', authenticateToken, (req, res) => {
    const { name, bank, card_type } = req.body;

    if (!name || !bank) {
        return res.status(400).json({ error: 'Card name and bank are required' });
    }

    db.run(
        'INSERT INTO cards (user_id, name, bank, card_type) VALUES (?, ?, ?, ?)',
        [req.user.id, name, bank, card_type || 'generic'],
        function (err) {
            if (err) {
                console.error('Error creating card:', err);
                return res.status(500).json({ error: 'Server error' });
            }
            res.status(201).json({
                id: this.lastID,
                user_id: req.user.id,
                name,
                bank,
                card_type: card_type || 'generic'
            });
        }
    );
});

// Update card
app.put('/api/cards/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { name, bank, card_type } = req.body;

    if (!name || !bank) {
        return res.status(400).json({ error: 'Card name and bank are required' });
    }

    db.run(
        'UPDATE cards SET name = ?, bank = ?, card_type = ? WHERE id = ? AND user_id = ?',
        [name, bank, card_type || 'generic', id, req.user.id],
        function (err) {
            if (err) {
                console.error('Error updating card:', err);
                return res.status(500).json({ error: 'Server error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Card not found' });
            }
            res.json({ id: parseInt(id), name, bank, card_type: card_type || 'generic' });
        }
    );
});

// Delete card
app.delete('/api/cards/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    db.run(
        'DELETE FROM cards WHERE id = ? AND user_id = ?',
        [id, req.user.id],
        function (err) {
            if (err) {
                console.error('Error deleting card:', err);
                return res.status(500).json({ error: 'Server error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Card not found' });
            }
            res.json({ message: 'Card deleted successfully' });
        }
    );
});


// Goals API
app.get('/api/goals', authenticateToken, (req, res) => {
    db.all('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
        if (err) {
            console.error('Error fetching goals:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        res.json(rows);
    });
});

app.post('/api/goals', authenticateToken, (req, res) => {
    const { name, target_amount, current_amount, deadline, color, icon } = req.body;

    if (!name || !target_amount) {
        return res.status(400).json({ error: 'Name and target amount are required' });
    }

    db.run(
        'INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, color, icon) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, name, target_amount, current_amount || 0, deadline, color, icon],
        function (err) {
            if (err) {
                console.error('Error creating goal:', err);
                return res.status(500).json({ error: 'Server error' });
            }
            res.status(201).json({
                id: this.lastID,
                user_id: req.user.id,
                name,
                target_amount,
                current_amount: current_amount || 0,
                deadline,
                color,
                icon
            });
        }
    );
});

app.put('/api/goals/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { name, target_amount, current_amount, deadline, color, icon } = req.body;

    if (!name || !target_amount) {
        return res.status(400).json({ error: 'Name and target amount are required' });
    }

    db.run(
        'UPDATE goals SET name = ?, target_amount = ?, current_amount = ?, deadline = ?, color = ?, icon = ? WHERE id = ? AND user_id = ?',
        [name, target_amount, current_amount, deadline, color, icon, id, req.user.id],
        function (err) {
            if (err) {
                console.error('Error updating goal:', err);
                return res.status(500).json({ error: 'Server error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Goal not found' });
            }
            res.json({ id, name, target_amount, current_amount, deadline, color, icon });
        }
    );
});

app.delete('/api/goals/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM goals WHERE id = ? AND user_id = ?', [id, req.user.id], function (err) {
        if (err) {
            console.error('Error deleting goal:', err);
            return res.status(500).json({ error: 'Server error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Goal not found' });
        }
        res.json({ message: 'Goal deleted' });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
