const express = require('express');
const router = express.Router();

const {register, login, refresh, verifyEmail, verifyToken, forgotPassword, resetPassword} = require('../controllers/authController');

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/verify-email", verifyEmail);
router.post("/verify-token",  verifyToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;