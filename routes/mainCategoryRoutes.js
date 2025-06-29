const express = require("express");
const router = express.Router();
const mainCategoryController = require("../controllers/mainCategoryController");

// Tüm mainCategory kayıtlarını getir
router.get("/", mainCategoryController.getAllMainCategories);
// Tree 
router.get("/tree", mainCategoryController.getUnifiedTreeWithParents);

// ID ile mainCategory getir
router.get("/:id", mainCategoryController.getMainCategoryById);

// Yeni mainCategory oluştur
router.post("/", mainCategoryController.createMainCategory);

// Var olan mainCategory güncelle
router.put("/:id", mainCategoryController.updateMainCategory);

// mainCategory sil
router.delete("/:id", mainCategoryController.deleteMainCategory);

module.exports = router;
