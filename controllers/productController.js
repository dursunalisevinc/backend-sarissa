const { Product, Variant } = require('../models');

exports.createProduct = async (req, res) => {
  try {
    // variants içinde variant array'ı var
    const { variants, ...productData } = req.body;

    // Yeni product ID oluşturma
    const last = await Product.findOne({ order: [['createdAt', 'DESC']] });
    let newId = 'product-1';
    if (last && last.Product_id && last.Product_id.startsWith('product-')) {
      const lastNumber = parseInt(last.Product_id.split('-')[1]);
      newId = `product-${lastNumber + 1}`;
    }

    // Product oluştur
    await Product.create({ Product_id: newId, ...productData });

    // variants.variant dizisi varsa varyantları oluştur
    if (
      variants &&
      typeof variants === 'object' &&
      Array.isArray(variants.variant) &&
      variants.variant.length > 0
    ) {
      for (const variant of variants.variant) {
        await Variant.create({
          ...variant,
          spec_name: variant.spec?.name || null,
          spec_value: variant.spec?._ || null,
          productId: newId
        });
      }
    }

    // Yeni ürünü varyantlarıyla birlikte getir
    const createdProduct = await Product.findByPk(newId, {
      include: [
        { model: Variant, as: 'variants' }
      ]
    });

    res.status(201).json({
      message: 'Ürün oluşturuldu',
      product: createdProduct
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Bir hata oluştu.', error: error.message });
  }
};


// Tüm ürünleri listele
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Variant, as: 'variants' }]
    });
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ürünleri getirirken bir hata oluştu.' });
  }
};

// Belirli bir ürünü getir
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Variant, as: 'variants' }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı.' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ürün getirilirken bir hata oluştu.' });
  }
};

// Ürünü güncelle
exports.updateProduct = async (req, res) => {
  try {
    const { variants, ...productData } = req.body;

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı.' });
    }

    await product.update(productData);

    // Varyant güncelleme: basitçe tümünü silip yeniden ekleyebiliriz
    await Variant.destroy({ where: { productId: product.id } });

    if (Array.isArray(variants) && variants.length > 0) {
      for (const variant of variants) {
        await Variant.create({ ...variant, productId: product.id });
      }
    }

    const updatedProduct = await Product.findByPk(product.id, {
      include: [{ model: Variant, as: 'variants' }]
    });

    res.status(200).json({ message: 'Ürün güncellendi', product: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Güncelleme sırasında hata oluştu.' });
  }
};

// Ürünü sil
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı.' });
    }

    await product.destroy(); // Variant'lar CASCADE ile zaten silinecek

    res.status(200).json({ message: 'Ürün silindi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Silme sırasında hata oluştu.' });
  }
};

