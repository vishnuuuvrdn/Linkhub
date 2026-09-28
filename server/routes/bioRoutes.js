const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { updateBio, getBio } = require('../controllers/bioController');

router.put('/', authMiddleware, updateBio);
router.get("/:username", getBio);

module.exports = router