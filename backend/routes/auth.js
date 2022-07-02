const express = require('express')

//Creating express router for different routes
const router = express.Router();

//Importing functions of different routes
const {
    registerUser,
    loginUser,
    logOut,
    forgotPassword,
    resetPassword,
    getUserProfile,
    updatePassword,
    updateProfile
} = require('../controllers/authController');

//To check is user logged in or not..
const {isAuthenticatedUser} = require('../middlewares/auth')

//User auth routes
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

router.route('/logout').get(logOut);

//Password routes
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);

//User routes
router.route('/password/update').put(isAuthenticatedUser, updatePassword);
router.route('/me').get(isAuthenticatedUser, getUserProfile);
router.route('/me/update').put(isAuthenticatedUser, updateProfile);



module.exports = router;