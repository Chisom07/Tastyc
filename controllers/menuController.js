const menuModel = require('../models/menuItem');

//Create a new menu item
exports.createMenuItem = async (req, res) => {
    const { name, description, price, category, ingredients } = req.body;
    const menuItem = new menuModel({ name, description, price, category, ingredients });
    try {
        const savedMenuItem = await menuItem.save();
        res.status(201).json(savedMenuItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//Get all menu items
exports.getMenuItems = async (req, res) => {
    try {
        const menuItems = await menuModel.find();
        res.json(menuItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Get a single menu item by ID
exports.getMenuItemById = async (req, res) => {
    try {
        const menuItem = await menuModel.findById(req.params.id);
        if (!menuItem) {
            return res.status(404).json({
                message: 'Menu item not found'
            });
        }
        res.json(menuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Update a menu item by ID
exports.updateMenuItem = async (req, res) => {
    const { name, description, price } = req.body;
    try {
        const updatedMenuItem = await menuModel.findByIdAndUpdate(
            req.params.id,
            { name, description, price },
            { new: true }
        );
        if (!updatedMenuItem) {
            return res.status(404).json({
                message: 'Menu item not found'
            });
        }
        res.json(updatedMenuItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Delete a menu item by ID
exports.deleteMenuItem = async (req, res) => {
    try {
        const deletedMenuItem = await menuModel.findByIdAndDelete(req.params.id);
        if (!deletedMenuItem) {
            return res.status(404).json({
                message: 'Menu item not found'
            });
        }
        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Filter menu items by category
exports.filterMenuItemsByCategory = async (req, res) => {
    const { category } = req.query;
    try {
        const filteredMenuItems = await menuModel.find({ category });
        res.json(filteredMenuItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Get only available menu items
exports.getAvailableMenuItems = async (req, res) => {
    try {
        const availableMenuItems = await menuModel.find({
            available: true
        });
        res.json(availableMenuItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
};