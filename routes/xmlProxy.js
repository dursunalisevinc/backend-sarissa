// routes/xmlProxy.js
const express = require('express');
const NodeCache = require('node-cache');
const axios = require('axios');
const { parseStringPromise } = require('xml2js');
const { MainCategory, Category, SubCategory } = require('../models'); // Veritabanı modelleri

const router = express.Router();
const cache = new NodeCache({ stdTTL: 86400 }); // 24 saat cache

// Eğer authMiddleware varsa açabilirsin
// const { verifyToken } = require('../middleware/authMiddleware');

// GET /xml/get-products
router.get('/get-products', /* verifyToken, */ async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let products = cache.get('products');

    if (!products) {
      const xmlUrl = 'https://cdn1.xmlbankasi.com/p1/bayginnbisiklet/image/data/xml/standart.xml';
      const response = await axios.get(xmlUrl);
      const json = await parseStringPromise(response.data, {
        explicitArray: false,
        mergeAttrs: true,
      });

      if (json && json.Products && json.Products.Product) {
        products = Array.isArray(json.Products.Product)
          ? json.Products.Product
          : [json.Products.Product];
      } else {
        products = [];
      }

      cache.set('products', products);
    }

    const paginatedProducts = products.slice(startIndex, endIndex);

    res.status(200).json({
      message: 'Ürünler başarıyla alındı',
      page,
      limit,
      total: products.length,
      data: paginatedProducts,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Ürünler alınamadı', error: err.message });
  }
});

// GET /xml/get-products-by-category
router.get('/get-products-by-category', /* verifyToken, */ async (req, res) => {
  try {
    const { mainCategory_id, category_id, subCategory_id } = req.query;

    let products = cache.get('products');

    if (!products) {
      const xmlUrl = 'https://cdn1.xmlbankasi.com/p1/bayginnbisiklet/image/data/xml/standart.xml';
      const response = await axios.get(xmlUrl);
      const json = await parseStringPromise(response.data, {
        explicitArray: false,
        mergeAttrs: true,
      });
      products = Array.isArray(json.Products.Product)
        ? json.Products.Product
        : [json.Products.Product];
      cache.set('products', products);
    }

    const filtered = products.filter((product) => {
      return (
        (!mainCategory_id || mainCategory_id === '' || product.mainCategory_id === mainCategory_id) &&
        (!category_id || category_id === '' || product.category_id === category_id) &&
        (!subCategory_id || subCategory_id === '' || product.subCategory_id === subCategory_id)
      );
    });

    res.status(200).json({
      message: 'Filtrelenmiş ürünler getirildi',
      total: filtered.length,
      data: filtered,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Filtreleme sırasında hata oluştu', error: err.message });
  }
});

// GET /xml/get-product-by-id/:id
router.get('/get-product-by-id/:id', /* verifyToken, */ async (req, res) => {
  try {
    const { id } = req.params;

    let products = cache.get('products');

    if (!products) {
      const xmlUrl = 'https://cdn1.xmlbankasi.com/p1/bayginnbisiklet/image/data/xml/standart.xml';
      const response = await axios.get(xmlUrl);
      const json = await parseStringPromise(response.data, {
        explicitArray: false,
        mergeAttrs: true,
      });
      products = Array.isArray(json.Products.Product)
        ? json.Products.Product
        : [json.Products.Product];
      cache.set('products', products);
    }

    const product = products.find((item) => item.Product_id === id);

    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    res.status(200).json({ message: 'Ürün bulundu', data: product });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Ürün getirilirken hata oluştu', error: err.message });
  }
});

// todo:dsjuhfuhdufhudfhughfduhguhdfuhgudfhughufdhg 


// Yardımcı: DB’den kategori ağacını getir
async function getDbCategoryTree() {
  const mainCategories = await MainCategory.findAll({
    include: [{
      model: Category,
      as: "categories",
      include: [{ model: SubCategory, as: "subCategories" }]
    }],
    order: [
      ["createdAt", "ASC"],
      [{ model: Category, as: "categories" }, "createdAt", "ASC"],
      [{ model: Category, as: "categories" }, { model: SubCategory, as: "subCategories" }, "createdAt", "ASC"],
    ],
  });

  return mainCategories.map(mainCat => ({
    id: String(mainCat.id),
    name: mainCat.name,
    parentName: null,
    parentId: null,
    children: mainCat.categories.map(cat => ({
      id: String(cat.id),
      name: cat.name,
      parentName: mainCat.name,
      parentId: String(mainCat.id),
      children: cat.subCategories.map(subCat => ({
        id: String(subCat.id),
        name: subCat.name,
        parentName: cat.name,
        parentId: String(cat.id),
        children: []
      }))
    }))
  }));
}

// Yardımcı: XML ürünlerinden kategori ağacı çıkar
function buildCategoryTreeFromXml(products) {
  const tree = [];
  const mainCategoryMap = new Map();

  products.forEach(product => {
    const mainCatId = String(product.mainCategory_id || 'unknown-main');
    const mainCatName = product.mainCategory || 'Bilinmeyen Ana Kategori';

    const categoryId = String(product.category_id || 'unknown-cat');
    const categoryName = product.category || 'Bilinmeyen Kategori';

    const subCatId = String(product.subCategory_id || 'unknown-subcat');
    const subCatName = product.subCategory || 'Bilinmeyen Alt Kategori';

    if (!mainCategoryMap.has(mainCatId)) {
      mainCategoryMap.set(mainCatId, {
        id: mainCatId,
        name: mainCatName,
        parentName: null,
        parentId: null,
        children: []
      });
    }

    const mainCat = mainCategoryMap.get(mainCatId);

    let category = mainCat.children.find(c => c.id === categoryId);
    if (!category) {
      category = {
        id: categoryId,
        name: categoryName,
        parentName: mainCatName,
        parentId: mainCatId,
        children: []
      };
      mainCat.children.push(category);
    }

    if (subCatId !== 'unknown-subcat') {
      let subCategory = category.children.find(sc => sc.id === subCatId);
      if (!subCategory) {
        subCategory = {
          id: subCatId,
          name: subCatName,
          parentName: categoryName,
          parentId: categoryId,
          children: []
        };
        category.children.push(subCategory);
      }
    }
  });

  return Array.from(mainCategoryMap.values());
}

// Yardımcı: Ağaçları birleştir
function mergeTrees(dbTree, xmlTree) {
  const mergedMap = new Map();

  const mergeChildren = (children1 = [], children2 = []) => {
    const map = new Map();
    children1.forEach(c => map.set(c.id, c));
    children2.forEach(c2 => {
      if (map.has(c2.id)) {
        const c1 = map.get(c2.id);
        c1.children = mergeChildren(c1.children, c2.children);
      } else {
        map.set(c2.id, c2);
      }
    });
    return Array.from(map.values());
  };

  dbTree.forEach(mainCat => mergedMap.set(mainCat.id, mainCat));
  xmlTree.forEach(xmlMainCat => {
    if (mergedMap.has(xmlMainCat.id)) {
      const existing = mergedMap.get(xmlMainCat.id);
      existing.children = mergeChildren(existing.children, xmlMainCat.children);
    } else {
      mergedMap.set(xmlMainCat.id, xmlMainCat);
    }
  });

  return Array.from(mergedMap.values());
}

// Ana controller
async function getUnifiedCategoryTree(req, res) {
  try {
    // 1) Veritabanından kategori ağacını al
    const dbTree = await getDbCategoryTree();

    // 2) Ürünler cache'te var mı?
    let products = cache.get('products');
    if (!products) {
      const xmlUrl = 'https://cdn1.xmlbankasi.com/p1/bayginnbisiklet/image/data/xml/standart.xml';
      const response = await axios.get(xmlUrl);

      const json = await parseStringPromise(response.data, {
        explicitArray: false,
        mergeAttrs: true,
      });

      products = Array.isArray(json?.Products?.Product)
        ? json.Products.Product
        : json.Products?.Product
          ? [json.Products.Product]
          : [];

      cache.set('products', products);
    }

    // 3) XML'den kategori ağacını kur (filtreleme burada)
    const xmlTree = buildCategoryTreeFromXml(products);

    // 4) Veritabanı ve XML ağaçlarını birleştir
    const unifiedTree = mergeTrees(dbTree, xmlTree);

    // 5) Temizlik: unknown-cat veya bozuklar çıkart
    const cleanedTree = cleanCategoryTree(unifiedTree);

    res.status(200).json({
      message: 'Birleştirilmiş kategori ağacı getirildi',
      data: cleanedTree
    });

  } catch (error) {
    console.error('Kategori ağacı alınırken hata:', error);
    res.status(500).json({
      message: 'Kategori ağacı alınırken hata oluştu',
      error: error.message
    });
  }
}

// XML ağacı kurarken geçersiz düğümleri atla
function buildCategoryTreeFromXml(products) {
  return products.map(product => {
    const categoryId = product?.CategoryID?.trim();
    const categoryName = product?.CategoryName?.trim();
    const parentId = product?.ParentCategoryID?.trim() || null;
    const parentName = product?.ParentCategoryName?.trim() || null;

    if (!categoryId || !categoryName || categoryName.toLowerCase().includes('bilinmeyen')) {
      console.warn(`Atlanan ürün: ${JSON.stringify(product)}`);
      return null;
    }

    return {
      id: categoryId,
      name: categoryName,
      parentId: parentId,
      parentName: parentName,
      children: []
    };
  }).filter(Boolean); // null'ları at
}

// Ağaçları birleştir
function mergeTrees(dbTree, xmlTree) {
  const cleanXmlTree = xmlTree.filter(node => node && node.id && node.name && !node.name.toLowerCase().includes('bilinmeyen'));
  return [...dbTree, ...cleanXmlTree];
}

// Tüm ağacı recursive temizle
function cleanCategoryTree(nodes) {
  return nodes
    .filter(node => node && node.id && node.name && !node.name.toLowerCase().includes('bilinmeyen'))
    .map(node => ({
      ...node,
      children: node.children?.length ? cleanCategoryTree(node.children) : []
    }));
}


// Router’a ekle
router.get('/unified-category-tree', /* verifyToken, */ getUnifiedCategoryTree);

module.exports = router;