const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        customerName: {
            type: String,
            required: true
        },
        customerPhone: {
            type: String,
            required: true
        },
        items: [
            {
                menuItemid: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'MenuItem',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                },
            }
        ],
        totalAmount: {
            type: Number,
            required: true
        },
        customerUsername: {
            type: String,
            default: ''
        },
        status: {
            type: String,
            enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
            default: 'pending'
        },
    },
    { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;