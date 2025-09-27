const express = require('express');
const { authentication } = require('../middlewares/authentication');
const { inventoryAccess, directorAccess } = require('../middlewares/authorization');
const { addItem, getItem, deleteItem, addVarient, getVarients, updateVarient, deleteVarient, getAllItem } = require('../controllers/itemController');
const router = express.Router();

//  Item Routes
router.post('/addItem', authentication, inventoryAccess, addItem);
router.patch('/updateItem', authentication, inventoryAccess, updateItem);
router.get('/getItem', authentication, getItem);
router.get('getAllItem', authentication, inventoryAccess, getAllItem);
router.delete('/deleteItem', authentication, directorAccess, deleteItem);

//  Varient Routes
router.post('/addVarient', authenciation, directorAccess, addVarient)
router.get('/getVarient', authenciation, directorAccess, getVarients);
router.patch('/updateVarient', authentication, directorAccess, updateVarient)
router.delete('/deleteVarient', authentication, directorAccess, deleteVarient);

module.exports = router;