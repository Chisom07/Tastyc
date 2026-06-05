const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Auth route
app.use('/api/auth', authRoutes);

// Use the routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Connect to MongoDB
mongoose
.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});


// Serve frontend static files (always). Ensure API routes are handled first.
app.use(express.static(path.join(__dirname, 'frontend')));

// For any non-API route, return frontend/index.html (SPA fallback).
app.get('/*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.resolve(__dirname, 'frontend', 'index.html'));
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

