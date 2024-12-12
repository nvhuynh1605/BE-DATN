const express = require('express');
const router = express.Router();
const { createCategory, getAllCategories, updateCategory, deleteCategory, searchCateGory } = require('../controllers/CategoryController');

router.post('/category', createCategory);
router.get('/category', getAllCategories);
router.put('/category/:id', updateCategory);
router.delete('/category/:id', deleteCategory);
router.get('/category/search', searchCateGory);

module.exports = router;