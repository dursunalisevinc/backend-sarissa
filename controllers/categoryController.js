const { Category, MainCategory } = require("../models");

// Yeni category oluştur
exports.createCategory = async (req, res) => {
  try {
    const { name, mainCategoryId } = req.body;

    // Ana kategori var mı kontrolü
    const mainCategory = await MainCategory.findByPk(mainCategoryId);
    if (!mainCategory) {
      return res.status(404).json({ message: "Ana kategori bulunamadı." });
    }

    // Son kaydın id'sinden yeni id oluştur
    const last = await Category.findOne({
      order: [["createdAt", "DESC"]]
    });
    const newId = last
      ? `category-${parseInt(last.id.split("-")[1]) + 1}`
      : "category-1";

    const category = await Category.create({
      id: newId,
      name,
      mainCategoryId
    });
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Bir hata oluştu." });
  }
};

// Tüm category'leri getir
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["createdAt", "DESC"]],
      include: [{ model: MainCategory, as: "mainCategory" }]
    });
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Bir hata oluştu." });
  }
};

// ID'ye göre category getir
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id, {
      include: [{ model: MainCategory, as: "mainCategory" }]
    });
    if (!category) {
      return res.status(404).json({ message: "Kategori bulunamadı." });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Bir hata oluştu." });
  }
};

// Category güncelle
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, mainCategoryId } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Kategori bulunamadı." });
    }

    if (mainCategoryId) {
      const mainCategory = await MainCategory.findByPk(mainCategoryId);
      if (!mainCategory) {
        return res.status(404).json({ message: "Ana kategori bulunamadı." });
      }
      category.mainCategoryId = mainCategoryId;
    }

    category.name = name !== undefined ? name : category.name;

    await category.save();

    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Bir hata oluştu." });
  }
};

// Category sil
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Kategori bulunamadı." });
    }
    await category.destroy();
    res.status(200).json({ message: "Kategori başarıyla silindi." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Bir hata oluştu." });
  }
};
