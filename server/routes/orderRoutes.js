const express = require('express');
const { authentication } = require('../middlewares/authentication');
const { createOrder, updateOrder, getAllOrders, searchOptions, getMyOrders, getOrder, deleteOrder, confirmOrder, deliverOrder, cancelOrder } = require('../controllers/orderController')
const { inventoryAccess, agentAccess, accountantAccess, directorAccess } = require('../middlewares/authorization');
const router = express.Router();

router.post('/createOrder', authentication, agentAccess, createOrder)
router.post('/updateOrder', authentication, accountantAccess, updateOrder);
router.post('/getAllOrders', authentication, accountantAccess, getAllOrders)
router.post('/searchOptions', authentication, agentAccess, searchOptions)
router.get('/getMyOrders', authentication, agentAccess, getMyOrders);
router.post('/getOrder', authentication, getOrder);
router.delete('/deleteOrder', authentication, directorAccess, deleteOrder);
router.patch('/confirmOrder', authentication, accountantAccess, confirmOrder);
router.patch('/cancelOrder', authentication, accountantAccess, cancelOrder);
router.patch('/deliverOrder', authentication, accountantAccess, deliverOrder);

module.exports = router