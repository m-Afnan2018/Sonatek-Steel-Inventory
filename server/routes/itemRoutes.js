const express = require('express');
const { authentication } = require('../middlewares/authentication');
const { inventoryAccess, directorAccess } = require('../middlewares/authorization');
const { addItem, getItem, deleteItem, addVarient, getVarients, updateVarient, deleteVarient, getAllItem, getAllVarients, updateItem, getAllDetailVarient, getUpcomingItem, uploadCSV, downloadTemplate, getExcelItem } = require('../controllers/itemController');
const { getAllWarehouseDetails } = require('../controllers/warehouseController');
const router = express.Router();

//  Item Routes
router.post('/addItem', authentication, inventoryAccess, addItem);
router.patch('/updateItem', authentication, inventoryAccess, updateItem);
router.post('/getItem', authentication, getItem);
router.post('/getAllItems', authentication, getAllItem);
router.get('/getAllWarehouseDetail', authentication, getAllWarehouseDetails);
router.delete('/deleteItem', authentication, directorAccess, deleteItem);
router.all('/getUpcomingItems', authentication, getUpcomingItem);
router.post('/uploadCSV', uploadCSV)
router.get('/downloadTemplate', downloadTemplate);
router.post('/getExcelItem', getExcelItem)

//  Varient Routes
router.post('/addVarient', authentication, directorAccess, addVarient)
router.get('/getVarient', getVarients);
router.get('/getAllVarients', getAllVarients);
router.patch('/updateVarient', authentication, directorAccess, updateVarient);
router.delete('/deleteVarient', authentication, directorAccess, deleteVarient);
router.get('/getAllDetailVarient', authentication, getAllDetailVarient);

module.exports = router;