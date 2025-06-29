const { SubCategory, Category } = require("../models");

exports.createSubCategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Kategori bulunamadı." });
    }
    const last = await SubCategory.findOne({
      order: [["createdAt", "DESC"]],
    });
    const newId = last
      ? `subCategory-${parseInt(last.id.split("-")[1]) + 1}`
      : "subCategory-1";
    const subCategory = await SubCategory.create({
      id: newId,
      name,
      categoryId,
    });
    res.status(201).json(subCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Bir hata oluştu." });
  }
};

exports.getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.findAll({
      include: [{ model: Category, as: "category" }],
    });
    res.status(200).json(subCategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Bir hata oluştu." });
  }
};
