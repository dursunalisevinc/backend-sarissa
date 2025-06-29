const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Tüm kategorileri getir
router.get("/", categoryController.getAllCategories);

// ID ile kategori getir
router.get("/:id", categoryController.getCategoryById);

// Yeni kategori oluştur
router.post("/", categoryController.createCategory);

// Kategori güncelle
router.put("/:id", categoryController.updateCategory);

// Kategori sil
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
