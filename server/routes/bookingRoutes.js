const express = require('express');
const { authentication } = require('../middlewares/authentication');
const { createBooking, updateBooking, getAllBookings, searchOptions, getMyBookings, getBooking, deleteBooking, confirmBooking, deliverBooking, cancelBooking, getAllBookingsDetails, getExcelBooking, getExcelItem, shippedBooking } = require('../controllers/bookingController')
const { inventoryAccess, agentAccess, accountantAccess, directorAccess } = require('../middlewares/authorization');
const router = express.Router();

router.post('/createBooking', authentication, agentAccess, createBooking)
router.post('/updateBooking', authentication, accountantAccess, updateBooking);
router.post('/getAllBookings', authentication, accountantAccess, getAllBookings)
router.post('/searchOptions', authentication, agentAccess, searchOptions)
router.get('/getMyBookings', authentication, agentAccess, getMyBookings);
router.post('/getBooking', authentication, getBooking);
router.delete('/deleteBooking', authentication, directorAccess, deleteBooking);
router.patch('/confirmBooking', authentication, accountantAccess, confirmBooking);
router.patch('/shippedBooking', authentication, accountantAccess, shippedBooking);
router.patch('/cancelBooking', authentication, accountantAccess, cancelBooking);
router.patch('/deliverBooking', authentication, accountantAccess, deliverBooking);
router.get('/getAllBookingsDetails', authentication, getAllBookingsDetails);
router.get('/getExcelBooking', getExcelBooking);
router.get('/getExcelItem', getExcelItem);

module.exports = router