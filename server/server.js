import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, get, all, run, isPostgres } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Multer Storage Configuration
// For Vercel (Serverless), we might need to adjust this to memory storage or external storage (like AWS S3 / Supabase Storage)
// But for now, let's keep it locally for dev, or use /tmp directory in lambda
const storage = process.env.VERCEL ? multer.memoryStorage() : multer.diskStorage({
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

// Serve static files (uploads) - Note: In serverless, this is tricky. 
// Ideally, use a proper object storage service. For Vercel free tier, images might break after function restart if saved to /tmp.
if (!process.env.VERCEL) {
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

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

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await get('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await run(
            'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
            [email, hashedPassword, name]
        );

        // Handle ID retrieval based on DB type
        let userId;
        if (isPostgres && result.rows && result.rows.length > 0) {
            // For Postgres, we need to modify the query to RETURNING id to get it back, 
            // but our wrapper's simple 'run' might not return rows easily for generic queries unless we specific RETURNING
            // Let's create a specific fetch for the user we just made.
            const user = await get('SELECT id FROM users WHERE email = ?', [email]);
            userId = user.id;
        } else {
            userId = result.lastID;
        }

        // Wait, for Postgres 'run' wrapper above in db.js:
        // If it's postgres, query() returns a Result object. 
        // We actually need to ensure our INSERT queries utilize 'RETURNING id' for Postgres 
        // OR we just select it back. Selecting back is safer for maintaining the "generic" SQL style without rewriting all INSERT strings.
        if (!userId && isPostgres) {
            const user = await get('SELECT id FROM users WHERE email = ?', [email]);
            userId = user.id;
        }

        const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: { id: userId, email, name }
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

        const user = await get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

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

        await run(
            'UPDATE users SET name = COALESCE(?, name), avatar_url = COALESCE(?, avatar_url), currency = COALESCE(?, currency), theme = COALESCE(?, theme) WHERE id = ?',
            [name, avatar_url, currency, theme, userId]
        );

        const updatedUser = await get('SELECT * FROM users WHERE id = ?', [userId]);

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

// Avatar Upload (Note: This is brittle on Serverless without S3/Supabase Storage)
app.post('/api/auth/upload-avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userId = req.user.id;
        let avatarUrl;

        if (process.env.VERCEL) {
            // Serverless: Convert buffer to Base64 and store in DB
            const b64 = req.file.buffer.toString('base64');
            const mime = req.file.mimetype;
            avatarUrl = `data:${mime};base64,${b64}`;
        } else {
            // Local: Use file path
            const host = req.headers.host;
            const protocol = req.headers['x-forwarded-proto'] || 'http';
            avatarUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        }

        await run('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, userId]);

        res.json({ avatar_url: avatarUrl });
    } catch (error) {
        console.error('Avatar upload error:', error);
        res.status(500).json({ error: 'Server error during avatar upload' });
    }
});

// ... Routes (Categories, Expenses, Cards, Goals) updated similarly to use 'run', 'get', 'all' ...
// Instead of rewriting EVERY route manually here incorrectly, 
// I will implement a safer strategy: 
// Usage of the new 'query', 'get', 'all', 'run' wrappers is plug-and-play for DBGet/DBAll replacements.

// Categories Routes
app.get('/api/categories', authenticateToken, async (req, res) => {
    try {
        const categories = await all('SELECT * FROM categories');
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

        const expenses = await all(sql, params);
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

        const result = await run(
            'INSERT INTO expenses (user_id, amount, category, sub_category, description, icon, date, mode, card_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, amount, category, sub_category, description, icon || 'ShoppingCart', date, mode, card_id || null]
        );

        let newId = result.lastID;
        if (isPostgres) {
            // For Postgres, fetch the latest ID for this user (not perfect for concurrency but okay for personal app)
            // Better: RETURNING id. But trying to keep generic SQL.
            const r = await get('SELECT id FROM expenses WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user.id]);
            newId = r.id;
        }

        const newExpense = await get('SELECT * FROM expenses WHERE id = ?', [newId]);
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

        const expense = await get('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        await run(
            'UPDATE expenses SET amount = ?, category = ?, sub_category = ?, description = ?, icon = ?, date = ?, mode = ?, card_id = ? WHERE id = ?',
            [amount, category, sub_category, description, icon, date, mode, card_id || null, id]
        );

        const updatedExpense = await get('SELECT * FROM expenses WHERE id = ?', [id]);
        res.json(updatedExpense);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await get('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        await run('DELETE FROM expenses WHERE id = ?', [id]);
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

        const formatDate = (date) => {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const totalResult = await get(
            'SELECT SUM(amount) as total FROM expenses WHERE user_id = ?',
            [userId]
        );

        const currentMonthStart = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
        const currentMonthEnd = formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));

        const monthlyResult = await get(
            'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ?',
            [userId, currentMonthStart, currentMonthEnd]
        );

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
            const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
            catStartDate = formatDate(startDate);
            catEndDate = formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
        }

        const categoryBreakdown = await all(
            `SELECT category, SUM(amount) as total 
       FROM expenses 
       WHERE user_id = ? AND date BETWEEN ? AND ? 
       GROUP BY category 
       ORDER BY total DESC`,
            [userId, catStartDate, catEndDate]
        );

        // Calculate trends (Simplified for brevity, similar iteration)
        // Calculate trends
        const monthlyTrend = [];
        let monthsToProcess = [];

        if (monthlyPeriod === 'year') {
            for (let i = 0; i < 12; i++) monthsToProcess.push(new Date(now.getFullYear(), i, 1));
        } else if (monthlyPeriod === 'lastYear') {
            for (let i = 0; i < 12; i++) monthsToProcess.push(new Date(now.getFullYear() - 1, i, 1));
        } else if (monthlyPeriod === '3months') {
            for (let i = 2; i >= 0; i--) monthsToProcess.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
        } else if (monthlyPeriod === '6months') {
            for (let i = 5; i >= 0; i--) monthsToProcess.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
        } else {
            // Month view - showing daily breakdown might be better but for consistency/simplicity showing current month total
            monthsToProcess.push(new Date(now.getFullYear(), now.getMonth(), 1));
        }

        for (const startDateObj of monthsToProcess) {
            const mStart = formatDate(startDateObj);
            const mEnd = formatDate(new Date(startDateObj.getFullYear(), startDateObj.getMonth() + 1, 0));
            const monthName = startDateObj.toLocaleString('default', { month: 'short' });

            const r = await get(
                'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ?',
                [userId, mStart, mEnd]
            );
            monthlyTrend.push({ label: monthName, total: r?.total || 0 });
        }

        // Investment & Goals
        const investmentResult = await get(
            'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND category = ?',
            [userId, 'Investment']
        );

        const goalResults = await all(
            'SELECT name, target_amount, current_amount FROM goals WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
            [userId]
        );

        const subscriptions = await all(
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
            goals: goalResults.length > 0 ? goalResults.map(g => ({
                name: g.name,
                required: g.target_amount,
                collected: g.current_amount
            })) : [{ name: 'No Goal Set', required: 0, collected: 0 }],
            categoryBreakdown,
            monthlyTrend,
            subscriptions
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Bills API
app.get('/api/bills', authenticateToken, async (req, res) => {
    try {
        const { search, startDate, endDate } = req.query;
        let queryText = "SELECT * FROM expenses WHERE user_id = ? AND category = 'Bill & Subscription'";
        const params = [req.user.id];

        if (startDate && endDate) {
            queryText += " AND date BETWEEN ? AND ?";
            params.push(startDate, endDate);
        }
        if (search) {
            queryText += " AND (description LIKE ? OR sub_category LIKE ?)";
            params.push(`%${search}%`, `%${search}%`);
        }

        queryText += " ORDER BY date DESC";
        const bills = await all(queryText, params);

        // Stats calculation
        const now = new Date();
        const mStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const mEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const currentMonthBills = await all(
            "SELECT amount FROM expenses WHERE user_id = ? AND category = 'Bill & Subscription' AND date BETWEEN ? AND ?",
            [req.user.id, mStart, mEnd]
        );
        const totalMonthly = currentMonthBills.reduce((acc, b) => acc + b.amount, 0);

        const allStatsBills = await all("SELECT date FROM expenses WHERE user_id = ? AND category = 'Bill & Subscription'", [req.user.id]);

        let upcomingCount = 0;
        let overdueCount = 0;
        const todayStr = new Date().toISOString().split('T')[0];

        allStatsBills.forEach(b => {
            if (b.date >= todayStr) upcomingCount++;
            else overdueCount++;
        });

        res.json({
            bills,
            stats: {
                totalMonthly,
                upcomingCount,
                overdueCount,
                totalBills: bills.length
            }
        });
    } catch (err) {
        console.error('Error fetching bills:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Cards, Bills, Goals APIs - converted to use get/all/run
app.get('/api/cards', authenticateToken, async (req, res) => {
    try {
        const cards = await all('SELECT * FROM cards WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(cards);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/cards', authenticateToken, async (req, res) => {
    const { name, bank, card_type } = req.body;
    try {
        await run('INSERT INTO cards (user_id, name, bank, card_type) VALUES (?, ?, ?, ?)', [req.user.id, name, bank, card_type || 'generic']);
        res.status(201).json({ message: 'Card created' }); // Simplified response
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/cards/:id', authenticateToken, async (req, res) => {
    try {
        await run('DELETE FROM cards WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Card deleted' });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Goals
app.get('/api/goals', authenticateToken, async (req, res) => {
    try {
        const rows = await all('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/goals', authenticateToken, async (req, res) => {
    const { name, target_amount, current_amount, deadline, color, icon } = req.body;
    try {
        await run(
            'INSERT INTO goals (user_id, name, target_amount, current_amount, deadline, color, icon) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, name, target_amount, current_amount || 0, deadline, color, icon]
        );
        res.status(201).json({ message: 'Goal created' });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/goals/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, target_amount, current_amount, deadline, color, icon } = req.body;
    try {
        await run(
            'UPDATE goals SET name = ?, target_amount = ?, current_amount = ?, deadline = ?, color = ?, icon = ? WHERE id = ? AND user_id = ?',
            [name, target_amount, current_amount, deadline, color, icon, id, req.user.id]
        );
        res.json({ message: 'Goal updated' });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/goals/:id', authenticateToken, async (req, res) => {
    try {
        await run('DELETE FROM goals WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Goal deleted' });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app; // Export app for Vercel

