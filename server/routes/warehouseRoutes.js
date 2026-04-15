const express = require('express');
const { authentication } = require('../middlewares/authentication');
const { inventoryAccess, directorAccess } = require('../middlewares/authorization');
const { addWarehouse, deleteWarehouse, hideWarehouse, showWarehouse, getDataByWarehouses, getAllWarehouseDetails, updateWarehouse } = require('../controllers/warehouseController');
const router = express.Router();

//  Item Routes
router.post('/addWarehouse', authentication, directorAccess, addWarehouse);
router.post('/hideWarehouse', authentication, directorAccess, hideWarehouse);
router.post('/showWarehouse', authentication, directorAccess, showWarehouse);
router.post('/updateWarehouse', authentication, directorAccess, updateWarehouse);
router.post('/getDataByWarehouses', authentication, directorAccess, getDataByWarehouses);
router.get('/getAllWarehouseDetails', authentication, directorAccess, getAllWarehouseDetails);
router.delete('/deleteWarehouse/:warehouseId', authentication, directorAccess, deleteWarehouse);

module.exports = router;