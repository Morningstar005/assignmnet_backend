const express = require('express');
const { verifyJWT } = require('../middlewares/auth.middleware');
const {registerUser, loginUser, logoutUser, refreshAccessToken} = require('../controller/user.controller.js');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login',loginUser)
router.post('/logout',verifyJWT,logoutUser)
router.post('/refreshToken',verifyJWT,refreshAccessToken)
module.exports = router;
