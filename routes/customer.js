const express = require('express');
const router = express.Router();

const {
    createCustomer,
    getAllCustomers,
    addAddressToCustomer,
    getCustomerById
} = require('../controllers/customerController');

// Yeni müşteri oluştur
router.post('/', createCustomer);

// Tüm müşterileri listele
router.get('/', getAllCustomers);

// Yeni adres ekleme:
router.post('/:id/addresses', addAddressToCustomer);

router.get('/:id', getCustomerById);


module.exports = router;
