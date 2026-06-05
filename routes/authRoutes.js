const express = require('express');
const { signup, login, logout, userAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', userAuth, logout);

module.exports = router;
