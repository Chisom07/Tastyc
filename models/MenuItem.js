const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        image: {
            type: String,
            default: ''
        },
        ingredients: {
            type: [String],
            default: []
        },
        available: {
            type: Boolean,
            default: true
        },
    },
    { timestamps: true },
);

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

module.exports = MenuItem;