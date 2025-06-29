const { MainCategory, Category, SubCategory } = require("../models");

// Yeni MainCategory oluştur
exports.createMainCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const last = await MainCategory.findOne({
      order: [["createdAt", "DESC"]]
    });
    const newId = last
      ? `mainCategory-${parseInt(last.id.split("-")[1]) + 1}`
      : "mainCategory-1";
    const mainCategory = await MainCategory.create({
      id: newId,
      name,
      description
    });
    res.status(201).json(mainCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Bir hata oluştu." });
  }
};

// Tüm MainCategory'leri getir
exports.getAllMainCategories = async (req, res) => {
  try {
    const mainCategories = await MainCategory.findAll({
      order: [["createdAt", "DESC"]]
    });
    res.status(200).json(mainCategories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Bir hata oluştu." });
  }
};

// ID'ye göre MainCategory getir
exports.getMainCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const mainCategory = await MainCategory.findByPk(id);
    if (!mainCategory) {
      return res.status(404).json({ message: "MainCategory bulunamadı." });
    }
    res.status(200).json(mainCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Bir hata oluştu." });
  }
};

// MainCategory güncelle
exports.updateMainCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const mainCategory = await MainCategory.findByPk(id);
    if (!mainCategory) {
      return res.status(404).json({ message: "MainCategory bulunamadı." });
    }

    mainCategory.name = name !== undefined ? name : mainCategory.name;
    mainCategory.description = description !== undefined ? description : mainCategory.description;

    await mainCategory.save();

    res.status(200).json(mainCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Bir hata oluştu." });
  }
};

// MainCategory sil
exports.deleteMainCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const mainCategory = await MainCategory.findByPk(id);
    if (!mainCategory) {
      return res.status(404).json({ message: "MainCategory bulunamadı." });
    }
    await mainCategory.destroy();
    res.status(200).json({ message: "MainCategory başarıyla silindi." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Bir hata oluştu." });
  }
};


async function mapSubCategories(subCategories, parentName) {
  return subCategories.map(sc => ({
    id: sc.id,
    name: sc.name,
    parentName,
    children: []
  }));
}

async function mapCategories(categories, parentName) {
  return Promise.all(categories.map(async (cat) => ({
    id: cat.id,
    name: cat.name,
    parentName,
    children: await mapSubCategories(cat.subCategories, cat.name)
  })));
}

exports.getUnifiedTreeWithParents = async (req, res) => {
  try {
    const mainCategories = await MainCategory.findAll({
      include: [{
        model: Category,
        as: "categories",
        include: [{
          model: SubCategory,
          as: "subCategories"
        }]
      }],
      order: [
        ["createdAt", "ASC"],
        [{ model: Category, as: "categories" }, "createdAt", "ASC"],
        [{ model: Category, as: "categories" }, { model: SubCategory, as: "subCategories" }, "createdAt", "ASC"],
      ],
    });

    const result = await Promise.all(
      mainCategories.map(async mainCat => ({
        id: mainCat.id,
        name: mainCat.name,
        parentName: null,
        children: await mapCategories(mainCat.categories, mainCat.name)
      }))
    );

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Bir hata oluştu." });
  }
};
