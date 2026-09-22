const express = require('express');
const router = express.Router();

const {register, login, refresh, verifyEmail, verifyToken} = require('../controllers/authController');

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/verify-email", verifyEmail);
router.post("/verify-token", verifyToken);

module.exports = router;