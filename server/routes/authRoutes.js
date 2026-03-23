const express = require('express');
const router = express.Router();

// Controllers
const { createDirector, registerUser, loginUser, forgetPassword, resetPassword, getUser, logoutUser } = require('../controllers/authController');

// Middlewares
const { adminAccess } = require('../middlewares/authorization');
const { authentication } = require('../middlewares/authentication');

router.post('/createDirector', adminAccess, createDirector);
router.post('/registerUser', registerUser);
router.post('/loginUser', loginUser);
router.post('/forgetPassword', forgetPassword);
router.post('/resetPassword', resetPassword);
router.get('/getUser', authentication, getUser);
router.get('/logoutUser', authentication, logoutUser);



module.exports = router;