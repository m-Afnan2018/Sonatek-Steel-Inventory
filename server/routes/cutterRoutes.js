const express = require('express');
const { authentication } = require('../middlewares/authentication');
const { inventoryAccess, directorAccess } = require('../middlewares/authorization');
const { addCutter, hideCutter, showCutter, getDataByCutters, getAllCutterDetails, updateCutter } = require('../controllers/cutterController');
const router = express.Router();

//  Item Routes
router.post('/addCutter', authentication, directorAccess, addCutter);
router.post('/hideCutter', authentication, directorAccess, hideCutter);
router.post('/showCutter', authentication, directorAccess, showCutter);
router.post('/updateCutter', authentication, directorAccess, updateCutter);
router.post('/getDataByCutters', authentication, directorAccess, getDataByCutters);
router.get('/getAllCutterDetails', authentication, directorAccess, getAllCutterDetails);

module.exports = router;