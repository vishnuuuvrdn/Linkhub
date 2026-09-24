const express = require("express")
const router = express.Router()
const {generateShortUrl, getShortUrlDetails, removeShortUrl, getOriginalUrl} = require("../controllers/urlController")
const authMiddleware = require("../middlewares/authMiddleware")


router.post("/", authMiddleware, generateShortUrl)
router.get("/", authMiddleware, getShortUrlDetails)
router.delete("/:customSlung", authMiddleware, removeShortUrl)
router.get("/r/:customSlung", authMiddleware, getOriginalUrl)

module.exports = router;