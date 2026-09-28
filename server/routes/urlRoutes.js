const express = require("express")
const router = express.Router()
const {generateShortUrl, getShortUrlDetails, removeShortUrl, getAnalytics} = require("../controllers/urlController")
const authMiddleware = require("../middlewares/authMiddleware")


router.post("/", authMiddleware, generateShortUrl)
router.get("/", authMiddleware, getShortUrlDetails)
router.delete("/:customSlung", authMiddleware, removeShortUrl)
router.get("/analytics", authMiddleware, getAnalytics)

module.exports = router;