const express = require('express');
const router = express.Router();

const {
  createAddress,
  getAddressesByCustomer
} = require('../controllers/addressController');

// Yeni adres ekle
router.post('/', createAddress);

// Bir müşterinin tüm adreslerini getir
router.get('/customer/:customerId', getAddressesByCustomer);

module.exports = router;
