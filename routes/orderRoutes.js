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

const router = express.Router();

//Place a new order
router.post('/', placeOrder);

//Get all orders
router.get('/', getOrders);

//Get a single order by ID
router.get('/:id', getOrderById);

//Update order status
router.put('/:id', updateOrderStatus);

//Cancel an order
router.delete('/:id', cancelOrder);

//Get orders by status
router.get('/status/:status', getOrdersByStatus);

//Get customer order history
router.get('/customer/:customerId', getCustomerOrderHistory);

module.exports = router;