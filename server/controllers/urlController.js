const Url = require("../models/urlModel");
const crypto = require("crypto");
require("dotenv").config();

const generateShortCode = () => {
  return crypto.randomBytes(3).toString("hex");
};

const generateShortUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    let { customSlung } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        message: "Original URL is required",
      });
    }

    try {
      new URL(originalUrl);
    } catch {
      return res.status(400).json({
        message: "Invalid URL",
      });
    }

    if (customSlung) {
      const slugRegex = /^[a-zA-Z0-9-_]+$/;

      if (!slugRegex.test(customSlung)) {
        return res.status(400).json({
          message:
            "Custom slug can contain only letters, numbers, hyphens and underscores",
        });
      }
    }

    if (!customSlung) {
      let isUnique = false;

      while (!isUnique) {
        customSlung = generateShortCode();

        const exists = await Url.findOne({
          customSlung,
        });

        if (!exists) {
          isUnique = true;
        }
      }
    } else {
      const slugExists = await Url.findOne({
        customSlung,
      });

      if (slugExists) {
        return res.status(409).json({
          message: "Custom slug already exists",
        });
      }
    }

    const shortUrl = `${process.env.HOST}/r/${customSlung}`;

    const url = new Url({
      userId: req.user.userId,
      originalUrl,
      customSlung,
      shortUrl,
      createdAt: new Date(),
    });

    await url.save();

    res.status(201).json({
      success: true,
      shortUrl,
    });
  } catch (error) {
    console.log("Error while generating Short Url:", error.message);

    res.status(500).json({
      message: "Can't generate short URL",
    });
  }
};

const getShortUrlDetails = async (req, res) => {
  try {
    const userId = req.user.userId;

    const response = await Url.find({
      userId,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(response);
  } catch (error) {
    console.log("ERROR while fetching shortUrl details:", error.message);

    res.status(500).json({
      message: "Can't fetch URL details. Try again later",
    });
  }
};

const removeShortUrl = async (req, res) => {
  try {
    const { customSlung } = req.params;
    const userId = req.user.userId;

    const response = await Url.findOneAndDelete({
      customSlung,
      userId,
    });

    if (!response) {
      return res.status(404).json({
        message: "URL not found",
      });
    }

    res.status(200).json({
      message: `Deleted ${customSlung} link`,
    });
  } catch (error) {
    console.log("ERROR while removing Url:", error.message);

    res.status(500).json({
      message: "Can't remove URL. Try again later",
    });
  }
};

const getOriginalUrl = async (req, res) => {
  try {
    const { customSlung } = req.params;

    const response = await Url.findOne({
      customSlung,
    });

    if (!response) {
      return res.status(404).json({
        message: "URL not found",
      });
    }

    return res.redirect(302, response.originalUrl);
  } catch (error) {
    console.log("ERROR while redirecting URL:", error.message);

    res.status(500).json({
      message: "Can't redirect URL. Try again later",
    });
  }
};

module.exports = { generateShortUrl, getShortUrlDetails, removeShortUrl, getOriginalUrl,};
