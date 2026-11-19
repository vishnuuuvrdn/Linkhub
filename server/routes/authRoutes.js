const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const { register, login, refresh, verifyEmail, verifyToken, forgotPassword, resetPassword, logout, getMe } = require('../controllers/authController');

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/verify-email", verifyEmail);
router.post("/verify-token",  verifyToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);
router.get("/me", authMiddleware, getMe);

module.exports = router;