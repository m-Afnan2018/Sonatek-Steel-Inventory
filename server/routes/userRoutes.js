const express = require('express');
const { updateUser, getUserDetails, listUsers, verifyUser, removeUser, updateUserRole, addUser, deleteUser } = require('../controllers/userController');
const { authentication } = require('../middlewares/authentication');
const { directorAccess } = require('../middlewares/authorization');
const router = express.Router();


router.put('/updateUser', authentication, updateUser);
router.get('/getUser', authentication, getUserDetails);
router.get('/getAllUsers', authentication, directorAccess, listUsers);
router.put('/verifyUser', authentication, directorAccess, verifyUser);
router.patch('/activeUser', authentication, directorAccess, addUser);
router.delete('/removeUser', authentication, directorAccess, removeUser);
router.delete('/deleteUser', authentication, directorAccess, deleteUser)
router.patch('/changeUserDesignation', authentication, directorAccess, updateUserRole);


module.exports = router;