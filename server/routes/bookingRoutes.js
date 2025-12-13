const express = require('express');
const { authentication } = require('../middlewares/authentication');
const { createBooking, updateBooking, getAllBookings, searchOptions, getMyBookings, getBooking, deleteBooking, confirmBooking, deliverBooking, cancelBooking, getAllBookingsDetails, getExcelBooking, shippedBooking, getAllBookingDetailsTablewise, getExcelTablewiseBooking, getAllIncompleteBookingsDetails, getAllParty, deleteParty, updateRemark, getAllPartyDetails, createBookingFromUpcoming, getAllBookingsByItem, createBookingFromInventory } = require('../controllers/bookingController')
const { inventoryAccess, agentAccess, accountantAccess, directorAccess } = require('../middlewares/authorization');
const router = express.Router();

router.post('/createBooking', authentication, agentAccess, createBooking)
router.post('/createBookingFromUpcoming', authentication, agentAccess, createBookingFromUpcoming)
router.post('/createBookingFromInventory', authentication, agentAccess, createBookingFromInventory)
router.post('/updateBooking', authentication, accountantAccess, updateBooking);
router.post('/updateRemark', authentication, accountantAccess, updateRemark);
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
router.post('/getAllBookingsDetailsTablewise', authentication, getAllBookingDetailsTablewise);
router.get('/getAllIncompleteBookingsDetails', authentication, getAllIncompleteBookingsDetails);
router.post('/getExcelTablewiseBooking', getExcelTablewiseBooking)
router.get('/getExcelBooking', getExcelBooking);
router.post('/getAllBookingsByItem', authentication, getAllBookingsByItem)

// Party Route
router.get('/getAllParty', authentication, getAllParty);
router.get('/getAllPartyDetails', authentication, getAllPartyDetails);
router.delete('/deleteParty', authentication, deleteParty);

module.exports = router