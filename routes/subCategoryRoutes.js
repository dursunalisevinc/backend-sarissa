const express = require('express');
const router = express.Router();

const subCategoryController = require('../controllers/subCategoryController');

// Örnek CRUD endpointleri:
router.get('/', subCategoryController.getAllSubCategories);
router.post('/', subCategoryController.createSubCategory);
// İsterseniz PUT, DELETE vs. ekleyebilirsiniz.

module.exports = router;
