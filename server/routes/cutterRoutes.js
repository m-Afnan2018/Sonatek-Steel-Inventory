const express = require('express');
const { authentication } = require('../middlewares/authentication');
const { inventoryAccess, directorAccess } = require('../middlewares/authorization');
const { addItem, getItem, deleteItem, addVarient, getVarients, updateVarient, deleteVarient, getAllItem, getAllVarients, updateItem, getAllDetailVarient } = require('../controllers/itemController');
const router = express.Router();

//  Item Routes
router.post('/addItem', authentication, inventoryAccess, addItem);
router.patch('/updateItem', authentication, inventoryAccess, updateItem);
router.post('/getItem', authentication, getItem);
router.post('/getAllItems', authentication, getAllItem);
router.delete('/deleteItem', authentication, directorAccess, deleteItem);

//  Varient Routes
router.post('/addVarient', authentication, directorAccess, addVarient)
router.get('/getVarient', getVarients);
router.get('/getAllVarients', getAllVarients);
router.patch('/updateVarient', authentication, directorAccess, updateVarient);
router.delete('/deleteVarient', authentication, directorAccess, deleteVarient);
router.get('/getAllDetailVarient', authentication, getAllDetailVarient);

module.exports = router;