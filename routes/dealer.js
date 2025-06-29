const express = require('express');
const router = express.Router();
const dealerController = require('../controllers/DealerController');

router.post('/', dealerController.createDealer);
router.get('/', dealerController.getAllDealers);
router.patch('/:id', dealerController.approveDealer); // bu bayi onaylama isteğimizdir.
router.get('/:id', dealerController.getDealerById);


module.exports = router;
