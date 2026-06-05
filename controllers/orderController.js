const orderModel = require('../models/Order');

//Place a new order
exports.placeOrder = async (req, res) => {
    const { customerName, customerPhone, items, totalAmount, customerUsername } = req.body;
    
    // Validate required fields
    if (!customerName || !customerPhone || !items || items.length === 0 || !totalAmount) {
        return res.status(400).json({ message: 'Missing required fields: customerName, customerPhone, items, totalAmount' });
    }

    const order = new orderModel({ 
        customerName, 
        customerPhone, 
        items, 
        totalAmount,
        customerUsername: customerUsername || ''
    });
    
    try {
        const savedOrder = await order.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//Get all orders
exports.getOrders = async (req, res) => {
    try {
        const orders = await orderModel.find();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Get a single order
exports.getOrderById = async (req, res) => {
    try {
        const order = await orderModel.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }
        if (req.user && req.user.role !== 'admin' && order.customerUsername !== req.user.username) {
            return res.status(403).json({ message: 'Access denied' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Update order status
exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const updatedOrder = await orderModel.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Cancel an order
exports.cancelOrder = async (req, res) => {
    try {
        const cancelledOrder = await orderModel.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled' },
            { new: true }
        );
        if (!cancelledOrder) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }
        res.json(cancelledOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Get orders by status
exports.getOrdersByStatus = async (req, res) => {
    const { status } = req.params;
    try {
        const orders = await orderModel.find({ status });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Get customer order history
exports.getCustomerOrderHistory = async (req, res) => {
    const { username } = req.params;
    if (req.user && req.user.role !== 'admin' && req.user.username !== username) {
        return res.status(403).json({ message: 'Access denied' });
    }
    try {
        const orders = await orderModel.find({ customerUsername: username });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
