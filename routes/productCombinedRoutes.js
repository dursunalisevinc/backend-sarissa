const express = require('express');
const router = express.Router();
const productCombinedController = require('../controllers/productCombinedController');

router.get('/all', productCombinedController.getAllProductsCombined);
router.get('/all/main-categories', productCombinedController.getMainCategoriesCombined);
router.get('/all/categories-by-main', productCombinedController.getCategoriesByMainCombined);
router.get('/all/subcategories-by-category', productCombinedController.getSubCategoriesByCategoryCombined);


// router.post('/', productCombinedController.createCategory);
router.post('/all/main-categories/sync', productCombinedController.syncMainCategories);  // DB'yi güncelle
router.post('/all/categories-by-main/sync', productCombinedController.syncCategoriesByMain);
router.post('/all/subcategories-by-category/sync', productCombinedController.syncSubCategoriesByCategory);

router.post('/all/main-categories', productCombinedController.createMainCategory);
router.post('/all/categories', productCombinedController.createCategory);
router.post('/all/subcategories', productCombinedController.createSubCategory);

router.post('/all/sync-all', productCombinedController.syncAllFromXml);//! Bu isteğin kategorilerden sonra düzenli olarak atılması gerek.

router.get('/all/by-id/:product_id', productCombinedController.getProductByProductIdCombined);

module.exports = router;

// /allProduct/all
