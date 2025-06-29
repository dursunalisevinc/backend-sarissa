const { Address } = require('../models');

// Adres ekle (bağımsız da kullanılabilir)
const createAddress = async (req, res) => {
  try {
    const { customerId, title, city, district, fullAddress, zipCode } = req.body;

    const newAddress = await Address.create({
      customerId,
      title,
      city,
      district,
      fullAddress,
      zipCode
    });

    res.status(201).json({ message: 'Adres başarıyla eklendi', address: newAddress });
  } catch (err) {
    res.status(500).json({ message: 'Adres eklenemedi', error: err });
  }
};

// Bir müşteriye ait tüm adresleri getir
const getAddressesByCustomer = async (req, res) => {
  try {
    const addresses = await Address.findAll({ where: { customerId: req.params.customerId } });

    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: 'Adresler alınamadı', error: err });
  }
};

module.exports = {
  createAddress,
  getAddressesByCustomer
};
