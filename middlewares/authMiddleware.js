const crypto = require('crypto');
const User = require('../models/User');

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const activeTokens = new Map();

const createToken = () => crypto.randomBytes(24).toString('hex');

const signup = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const user = new User({ username, password, role: 'user' });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        const token = createToken();
        activeTokens.set(token, { username, role: 'admin' });
        return res.json({ token, role: 'admin', username });
    }

    try {
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = createToken();
        activeTokens.set(token, { username: user.username, role: user.role });
        return res.json({ token, role: user.role, username: user.username });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const logout = (req, res) => {
    const authHeader = req.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (token && activeTokens.has(token)) {
        activeTokens.delete(token);
    }

    return res.json({ message: 'Logged out' });
};

const authFromToken = req => {
    const authHeader = req.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    return activeTokens.get(token) || null;
};

const userAuth = (req, res, next) => {
    const auth = authFromToken(req);
    if (!auth) {
        return res.status(401).json({ message: 'Authorization token required' });
    }

    req.user = auth;
    next();
};

const adminAuth = (req, res, next) => {
    const auth = authFromToken(req);
    if (!auth || auth.role !== 'admin') {
        return res.status(401).json({ message: 'Admin access required' });
    }

    req.user = auth;
    next();
};

module.exports = {
    signup,
    login,
    logout,
    userAuth,
    adminAuth,
};
