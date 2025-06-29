const axios = require('axios');
const NodeCache = require('node-cache');
const { parseStringPromise } = require('xml2js');
const { Product, Variant } = require('../models');
// const { sequelize } = require('../models');
const { Op } = require('sequelize'); 
const cache = new NodeCache({ stdTTL: 86400 }); // 24 saat
const XML_URL = 'https://cdn1.xmlbankasi.com/p1/bayginnbisiklet/image/data/xml/standart.xml';
const { MainCategory, Category, SubCategory } = require('../models'); 


// Bu tüm ürünleri getirir
exports.getAllProductsCombined = async (req, res) => {
  try {
    const { mainCategory_id, category_id, subCategory_id } = req.query;

    // 1. DB ürünlerini filtrele
    const dbWhere = {};
    if (mainCategory_id) dbWhere.mainCategory_id = mainCategory_id;
    if (category_id) dbWhere.category_id = category_id;
    if (subCategory_id) dbWhere.subCategory_id = subCategory_id;

    const productsFromDb = await Product.findAll({
      where: dbWhere,
      include: [{ model: Variant, as: 'variants' }]
    });

    // 2. XML ürünlerini çek
    let productsFromXml = cache.get('products');
    if (!productsFromXml) {
      const response = await axios.get(XML_URL);
      const json = await parseStringPromise(response.data, {
        explicitArray: false,
        mergeAttrs: true,
      });
      productsFromXml = Array.isArray(json.Products.Product)
        ? json.Products.Product
        : [json.Products.Product];
      cache.set('products', productsFromXml);
    }

    // 3. XML ürünlerini filtrele
    const filteredXmlProducts = productsFromXml.filter(product => {
      return (
        (!mainCategory_id || product.mainCategory_id === mainCategory_id) &&
        (!category_id || product.category_id === category_id) &&
        (!subCategory_id || product.subCategory_id === subCategory_id)
      );
    });

    // 4. Formatlama yok, direkt ham haliyle gönder
    res.status(200).json({
      total: productsFromDb.length + filteredXmlProducts.length,
      fromDb: productsFromDb,
      fromXml: filteredXmlProducts
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Ürünler alınırken hata oluştu',
      error: error.message
    });
  }
};


// todo: ürün id sine göre listele 

exports.getProductByProductIdCombined = async (req, res) => {
  try {
    const { product_id } = req.params;

    if (!product_id) {
      return res.status(400).json({ message: "product_id parametresi zorunludur." });
    }

    // 1. DB'den ürünü al
    const productFromDb = await Product.findOne({
      where: { Product_id: product_id },
      include: [{ model: Variant, as: 'variants' }]
    });

    // 2. XML'den ürünü al
    let productsFromXml = cache.get('products');
    if (!productsFromXml) {
      const response = await axios.get(XML_URL);
      const json = await parseStringPromise(response.data, {
        explicitArray: false,
        mergeAttrs: true
      });
      productsFromXml = Array.isArray(json.Products.Product)
        ? json.Products.Product
        : [json.Products.Product];
      cache.set('products', productsFromXml);
    }

    const productFromXml = productsFromXml.find(
      p => p.Product_id === product_id
    );

    // 3. Sonucu dön
    res.status(200).json({
      fromDb: productFromDb || null,
      fromXml: productFromXml || null
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ürün alınırken hata oluştu", error: error.message });
  }
};



// Tüm ana main kategorilerini getirir.
exports.getMainCategoriesCombined = async (req, res) => {
  try {
    const categories = await MainCategory.findAll({
      // where: { isActive: true },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      message: 'Main kategoriler getirildi',
      data: categories
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Main kategori alınırken hata oluştu', error: error.message });
  }
};



//! mainCategory id ye göre kategori getiriyor
exports.getCategoriesByMainCombined = async (req, res) => {
  try {
    const { mainCategory_id } = req.query;
    if (!mainCategory_id) {
      return res.status(400).json({ message: 'mainCategory_id zorunludur.' });
    }

    const categories = await Category.findAll({
      where: { mainCategoryId: mainCategory_id }, // aktif olanları getir
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      message: 'Kategori listesi getirildi',
      data: categories
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kategori alınırken hata oluştu', error: error.message });
  }
};


// ! category i db de günceller 
exports.syncCategoriesByMain = async (req, res) => {
  try {
    const { mainCategory_id } = req.body;
    if (!mainCategory_id) {
      return res.status(400).json({ message: 'mainCategory_id zorunludur.' });
    }

    // DB'den filtreli kategoriler
    const categoriesFromDb = await Product.findAll({
      where: { mainCategory_id },
      attributes: ['category_id', 'category'],
      group: ['category_id', 'category']
    });

    // XML ürünleri
    let productsFromXml = cache.get('products');
    if (!productsFromXml) {
      const response = await axios.get(XML_URL);
      const json = await parseStringPromise(response.data, { explicitArray: false, mergeAttrs: true });
      productsFromXml = Array.isArray(json.Products.Product) ? json.Products.Product : [json.Products.Product];
      cache.set('products', productsFromXml);
    }

    // XML’den filtreli kategoriler
    const filteredXml = productsFromXml.filter(p => p.mainCategory_id === mainCategory_id);

    // Birleştir
    const combined = [
      ...categoriesFromDb.map(c => ({ id: c.category_id, name: c.category })),
      ...filteredXml.map(c => ({ id: c.category_id, name: c.category }))
    ];

    // Tekilleştir
    const map = new Map();
    combined.forEach(c => {
      if (c.id && !map.has(c.id)) {
        map.set(c.id, c.name);
      }
    });

    const result = Array.from(map.entries()).map(([id, name]) => ({ id, name }));

    const processedIds = [];

    // DB güncelleme mantığı (MainCategory senkronize olduğunda category için uygun tablo ve model kullan)
    for (const cat of result) {
      processedIds.push(cat.id);
      const [category, created] = await Category.findOrCreate({
        where: { id: cat.id },
        defaults: { name: cat.name, mainCategory_id, isActive: true }
      });

      if (!created) {
        if (category.name !== cat.name || !category.isActive) {
          category.name = cat.name;
          category.isActive = true;
          await category.save();
        }
      }
    }

    // Kullanılmayan kategorileri pasif yap
    await Category.update(
      { isActive: false },
      { where: { mainCategory_id, id: { [require('sequelize').Op.notIn]: processedIds } } }
    );

    res.status(200).json({
      message: 'Kategori senkronize edildi',
      updated: result.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Kategori senkronize edilirken hata oluştu', error: error.message });
  }
};

// ! sub için 

exports.getSubCategoriesByCategoryCombined = async (req, res) => {
  try {
    const { category_id } = req.query;
    if (!category_id) {
      return res.status(400).json({ message: 'category_id zorunludur.' });
    }

    const subCategories = await SubCategory.findAll({
      where: { categoryId: category_id }, // sadece aktif olanlar
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      message: 'Alt kategoriler getirildi',
      data: subCategories
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Alt kategori alınırken hata oluştu', error: error.message });
  }
};

// ! sub sync
exports.syncSubCategoriesByCategory = async (req, res) => {
  try {
    const { category_id } = req.body;
    if (!category_id) {
      return res.status(400).json({ message: 'category_id zorunludur.' });
    }

    // DB subcategory’leri
    const subCategoriesFromDb = await Product.findAll({
      where: { category_id },
      attributes: ['subCategory_id', 'subCategory'],
      group: ['subCategory_id', 'subCategory']
    });

    // XML’den
    let productsFromXml = cache.get('products');
    if (!productsFromXml) {
      const response = await axios.get(XML_URL);
      const json = await parseStringPromise(response.data, { explicitArray: false, mergeAttrs: true });
      productsFromXml = Array.isArray(json.Products.Product) ? json.Products.Product : [json.Products.Product];
      cache.set('products', productsFromXml);
    }

    const filteredXml = productsFromXml.filter(p => p.category_id === category_id);

    // Birleştir
    const combined = [
      ...subCategoriesFromDb.map(s => ({ id: s.subCategory_id, name: s.subCategory })),
      ...filteredXml.map(s => ({ id: s.subCategory_id, name: s.subCategory }))
    ];

    // Tekilleştir
    const map = new Map();
    combined.forEach(s => {
      if (s.id && !map.has(s.id)) {
        map.set(s.id, s.name);
      }
    });

    const result = Array.from(map.entries()).map(([id, name]) => ({ id, name }));

    const processedIds = [];

    // DB güncelle (SubCategory tablosuna göre uyarlayın)
    for (const sub of result) {
      processedIds.push(sub.id);
      const [record, created] = await SubCategory.findOrCreate({
        where: { id: sub.id },
        defaults: { name: sub.name, category_id, isActive: true }
      });

      if (!created) {
        if (record.name !== sub.name || !record.isActive) {
          record.name = sub.name;
          record.isActive = true;
          await record.save();
        }
      }
    }

    // Kullanılmayanları pasifleştir
    await SubCategory.update(
      { isActive: false },
      { where: { category_id, id: { [require('sequelize').Op.notIn]: processedIds } } }
    );

    res.status(200).json({
      message: 'Alt kategoriler senkronize edildi',
      updated: result.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Alt kategoriler senkronize edilirken hata oluştu', error: error.message });
  }
};



// DB yi maine göre güncelle
exports.syncMainCategories = async (req, res) => {
  try {
    // Önce birleşik main category listesi al
    const productsFromDb = await Product.findAll({
      attributes: ['mainCategory_id', 'mainCategory']
    });

    let productsFromXml = cache.get('products');
    if (!productsFromXml) {
      const response = await axios.get(XML_URL);
      const json = await parseStringPromise(response.data, {
        explicitArray: false,
        mergeAttrs: true
      });
      productsFromXml = Array.isArray(json.Products.Product)
        ? json.Products.Product
        : [json.Products.Product];
      cache.set('products', productsFromXml);
    }

    const combined = [
      ...productsFromDb.map(p => ({ id: p.mainCategory_id, name: p.mainCategory })),
      ...productsFromXml.map(p => ({ id: p.mainCategory_id, name: p.mainCategory }))
    ];

    const map = new Map();
    combined.forEach(c => {
      if (c.id && !map.has(c.id)) {
        map.set(c.id, c.name);
      }
    });

    const result = Array.from(map.entries()).map(([id, name]) => ({ id, name }));

    // DB güncelle
    const processedIds = [];
    for (const cat of result) {
      processedIds.push(cat.id);
      const [mc, created] = await MainCategory.findOrCreate({
        where: { id: cat.id },
        defaults: { name: cat.name, isActive: true }
      });

      if (!created && mc.name !== cat.name) {
        mc.name = cat.name;
        mc.isActive = true;
        await mc.save();
      } else if (!created && !mc.isActive) {
        mc.isActive = true;
        await mc.save();
      }
    }

    await MainCategory.update(
      { isActive: false },
      {
        where: {
          id: { [require('sequelize').Op.notIn]: processedIds }
        }
      }
    );

    res.status(200).json({
      message: 'Main kategoriler DB ile senkronize edildi',
      updated: result.length
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Main kategoriler senkronize edilirken hata oluştu', error: error.message });
  }
};


// name, mainId ile category olustur 
// exports.createCategory = async (req, res) => {
//   try {
//     const { name, mainCategory_id } = req.body;

//     if (!name || !mainCategory_id) {
//       return res.status(400).json({
//         message: 'name ve mainCategory_id zorunludur.'
//       });
//     }

//     // mainCategory_id'nin geçerli olup olmadığını kontrol et (isteğe bağlı ama önerilir)
//     const mainCategory = await MainCategory.findByPk(mainCategory_id);
//     if (!mainCategory) {
//       return res.status(404).json({ message: 'Geçerli bir mainCategory bulunamadı.' });
//     }

//     // Kategori oluştur
//     const category = await Category.create({
//       name,
//       mainCategory_id
//     });

//     res.status(201).json({
//       message: 'Kategori başarıyla oluşturuldu',
//       data: category
//     });

//   } catch (error) {
//     console.error('createCategory hatası:', error);
//     res.status(500).json({
//       message: 'Kategori oluşturulurken hata oluştu',
//       error: error.message
//     });
//   }
// };


// ! ORTAK MAİN CATEGORY OLUŞTURMAK
exports.createMainCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // En son oluşturulan mainCategory'yi bul, id'si 'mainCategory-xxx' formatında olmalı
    const last = await MainCategory.findOne({
      where: {
        id: { [Op.like]: 'mainCategory-%' }
      },
      order: [['createdAt', 'DESC']]
    });

    const newId = last
      ? `mainCategory-${parseInt(last.id.split('-')[1]) + 1}`
      : 'mainCategory-1';

    const mainCategory = await MainCategory.create({
      id: newId,
      name,
      description
    });

    res.status(201).json(mainCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Bir hata oluştu.', error: error.message });
  }
};



// ! ortak main istek 
exports.createCategory = async (req, res) => {
  try {
    const { name, mainCategoryId } = req.body;

    // Ana kategori var mı kontrol et
    const mainCategory = await MainCategory.findByPk(mainCategoryId);
    if (!mainCategory) {
      return res.status(404).json({ message: "Ana kategori bulunamadı." });
    }

    // Son category id'sini bul (category-xxx formatında)
    const last = await Category.findOne({
      where: {
        id: { [Op.like]: 'category-%' }
      },
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
    res.status(500).json({ message: "Bir hata oluştu.", error: error.message });
  }
};


//! ortak Sub cetgory ekle
exports.createSubCategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    // Kategori var mı kontrol et
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Kategori bulunamadı." });
    }

    // Son subCategory id'sini bul (subCategory-xxx formatında)
    const last = await SubCategory.findOne({
      where: {
        id: { [Op.like]: 'subCategory-%' }
      },
      order: [["createdAt", "DESC"]]
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
    res.status(500).json({ message: "Bir hata oluştu.", error: error.message });
  }
};



// exports.getSubCategoriesByCategoryCombined = async (req, res) => {
//   try {
//     const { category_id } = req.query;

//     if (!category_id) {
//       return res.status(400).json({ message: 'category_id zorunludur.' });
//     }

//     // DB
//     const productsFromDb = await Product.findAll({
//       where: { category_id },
//       attributes: ['subCategory_id', 'subCategory']
//     });

//     // XML
//     let productsFromXml = cache.get('products');
//     if (!productsFromXml) {
//       const response = await axios.get(XML_URL);
//       const json = await parseStringPromise(response.data, {
//         explicitArray: false,
//         mergeAttrs: true
//       });
//       productsFromXml = Array.isArray(json.Products.Product)
//         ? json.Products.Product
//         : [json.Products.Product];
//       cache.set('products', productsFromXml);
//     }

//     // Filtre XML
//     const filteredXml = productsFromXml.filter(p => p.category_id === category_id);

//     const combined = [
//       ...productsFromDb.map(p => ({ id: p.subCategory_id, name: p.subCategory })),
//       ...filteredXml.map(p => ({ id: p.subCategory_id, name: p.subCategory }))
//     ];

//     const map = new Map();
//     combined.forEach(c => {
//       if (c.id && !map.has(c.id)) {
//         map.set(c.id, c.name);
//       }
//     });

//     const result = Array.from(map.entries()).map(([id, name]) => ({ id, name }));

//     res.status(200).json({
//       message: 'Alt kategori listesi getirildi',
//       data: result
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Alt kategori alınırken hata oluştu', error: error.message });
//   }
// };



exports.syncAllFromXml = async (req, res) => {
  try {
    // 1) XML veri al
    let productsFromXml = cache.get('products');
    if (!productsFromXml) {
      const response = await axios.get(XML_URL);
      const json = await parseStringPromise(response.data, {
        explicitArray: false,
        mergeAttrs: true
      });
      productsFromXml = Array.isArray(json.Products.Product)
        ? json.Products.Product
        : [json.Products.Product];
      cache.set('products', productsFromXml);
    }

    // 2) Map’lerle kategorileri ayıkla
    const mainMap = new Map();
    const categoryMap = new Map();
    const subCategoryMap = new Map();

    for (const p of productsFromXml) {
      if (p.mainCategory_id) {
        mainMap.set(p.mainCategory_id, p.mainCategory);
      }
      if (p.category_id) {
        categoryMap.set(p.category_id, {
          name: p.category,
          mainCategory_id: p.mainCategory_id
        });
      }
      if (p.subCategory_id) {
        subCategoryMap.set(p.subCategory_id, {
          name: p.subCategory,
          category_id: p.category_id
        });
      }
    }

    // 3) MainCategory sync
    const mainIds = [];
    for (const [id, name] of mainMap) {
      mainIds.push(id);
      const [mainCat, created] = await MainCategory.findOrCreate({
        where: { id },
        defaults: { name, isActive: true }
      });
      if (!created && (mainCat.name !== name || !mainCat.isActive)) {
        mainCat.name = name;
        mainCat.isActive = true;
        await mainCat.save();
      }
    }
    await MainCategory.update(
      { isActive: false },
      { where: { id: { [require('sequelize').Op.notIn]: mainIds } } }
    );

    // 4) Category sync
    const categoryIds = [];
    for (const [id, { name, mainCategory_id }] of categoryMap) {
      categoryIds.push(id);
      const [category, created] = await Category.findOrCreate({
        where: { id },
        defaults: { name, mainCategoryId: mainCategory_id, isActive: true }
      });
      if (!created && (category.name !== name || category.mainCategoryId !== mainCategory_id || !category.isActive)) {
        category.name = name;
        category.mainCategoryId = mainCategory_id;
        category.isActive = true;
        await category.save();
      }
    }
    await Category.update(
      { isActive: false },
      { where: { id: { [require('sequelize').Op.notIn]: categoryIds } } }
    );

    // 5) SubCategory sync
    const subIds = [];
    for (const [id, { name, category_id }] of subCategoryMap) {
      subIds.push(id);
      const [subCat, created] = await SubCategory.findOrCreate({
        where: { id },
        defaults: { name, categoryId: category_id, isActive: true }
      });
      if (!created && (subCat.name !== name || subCat.categoryId !== category_id || !subCat.isActive)) {
        subCat.name = name;
        subCat.categoryId = category_id;
        subCat.isActive = true;
        await subCat.save();
      }
    }
    await SubCategory.update(
      { isActive: false },
      { where: { id: { [require('sequelize').Op.notIn]: subIds } } }
    );

    // 6) İş bitti!
    res.status(200).json({ message: 'Main, Category ve SubCategory başarıyla senkronize edildi!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Senkronizasyon hatası', error: error.message });
  }
};
