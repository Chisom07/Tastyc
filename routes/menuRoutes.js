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

const router = express.Router();

//Create a new menu item
router.post('/', createMenuItem);

//Get all menu items
router.get('/', getMenuItems);

//Get a single menu item by ID
router.get('/:id', getMenuItemById);

//Update a menu item by ID
router.put('/:id', updateMenuItem);

//Delete a menu item by ID
router.delete('/:id', deleteMenuItem);

//Filter menu items by category
router.get('/filter', filterMenuItemsByCategory);

//Get only available menu items
router.get('/available', getAvailableMenuItems);

module.exports = router;