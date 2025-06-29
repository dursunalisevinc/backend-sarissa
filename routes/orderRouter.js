const express = require('express');
const router = express.Router();

const orderController = require('../controllers/orderController');

// Sipariş oluşturma
router.post('/', orderController.createOrder);

// Sipariş durumu ve kargo bilgisini güncelleme
router.put('/:orderId', orderController.updateOrderStatusAndShipping);

// İstersen başka siparişle ilgili endpoint'ler de buraya eklenebilir

module.exports = router;
