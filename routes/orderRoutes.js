const express = require('express');
const {
    placeOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
    getOrdersByStatus,
    getCustomerOrderHistory
} = require('../controllers/orderController');
const { adminAuth, userAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

//Place a new order
router.post('/', placeOrder);

// Admin-protected order routes
router.get('/status/:status', adminAuth, getOrdersByStatus);
router.get('/', adminAuth, getOrders);
router.get('/customer/:username', userAuth, getCustomerOrderHistory);
router.get('/:id', userAuth, getOrderById);
router.put('/:id', adminAuth, updateOrderStatus);
router.delete('/:id', adminAuth, cancelOrder);

module.exports = router;