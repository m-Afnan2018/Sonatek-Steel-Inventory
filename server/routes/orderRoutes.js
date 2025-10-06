const express = require('express');
const { authentication } = require('../middlewares/authentication');
const { createOrder, updateOrder, getAllOrders, searchOptions } = require('../controllers/orderController')
const { inventoryAccess, agentAccess, accountantAccess } = require('../middlewares/authorization');
const router = express.Router();

router.post('/createOrder', authentication, agentAccess, createOrder)
router.post('/updateOrder', authentication, accountantAccess, updateOrder);
router.post('/getAllOrders', authentication, accountantAccess, getAllOrders)
router.post('/searchOptions', authentication, agentAccess, searchOptions)
router.get

module.exports = router