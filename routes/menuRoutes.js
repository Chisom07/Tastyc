const express = require('express');
const {
    createMenuItem,
    getMenuItems,
    getMenuItemById,
    updateMenuItem,
    deleteMenuItem,
    filterMenuItemsByCategory,
    getAvailableMenuItems
} = require('../controllers/menuController');
const { adminAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

//Create a new menu item (admin)
router.post('/', adminAuth, createMenuItem);

//Get all menu items
router.get('/', getMenuItems);

//Get a single menu item by ID
router.get('/:id', getMenuItemById);

//Update a menu item by ID (admin)
router.put('/:id', adminAuth, updateMenuItem);

//Delete a menu item by ID (admin)
router.delete('/:id', adminAuth, deleteMenuItem);

//Filter menu items by category
router.get('/filter', filterMenuItemsByCategory);

//Get only available menu items
router.get('/available', getAvailableMenuItems);

module.exports = router;