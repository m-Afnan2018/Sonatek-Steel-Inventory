const express = require('express');
const router = express.Router();

// Controllers
const { createDirector, registerUser, loginUser } = require('../controllers/authController');

// Middlewares
const { adminAccess } = require('../middlewares/authorization');
const { authentication } = require('../middlewares/authentication');
const { updateUser } = require('../controllers/userController');

router.post('/createDirector', adminAccess, createDirector);
router.post('/registerUser', registerUser);
router.post('/loginUser', loginUser);
router.put('/updateUser', authentication, updateUser);



module.exports = router;