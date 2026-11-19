const { Url, Analytics } = require("../models/urlModel");
const { User } = require("../models/userModel");
const { ensureHandle } = require("../utils/handle");
const crypto = require("crypto");
require("dotenv").config();
const { UAParser } = require("ua-parser-js");

const generateShortCode = () => crypto.randomBytes(3).toString("hex");

const getDeviceBucket = (userAgent) => {
  const { os, device } = new UAParser(userAgent).getResult();
  const osName = os.name || "";

  if (device.type === "mobile" || device.type === "tablet" || ["iOS", "Android"].includes(osName)) {
    return "Mobile";
  }
  if (/^(Windows|Linux|macOS|Mac OS|Ubuntu|Debian|Fedora|Chrome ?OS)/i.test(osName)) {
    return "Desktop";
  }
  return "Other";
};

const generateShortUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    let { customSlung } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: "Original URL is required" });
    }

    let parsed;
    try {
      parsed = new URL(originalUrl);
    } catch {
      return res.status(400).json({ message: "Invalid URL" });
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res.status(400).json({ message: "Only http and https URLs are allowed" });
    }

    const userId = req.user.userId;

    const owner = await User.findById(userId);
    if (!owner) {
      return res.status(401).json({ message: "User not found" });
    }
    const handle = await ensureHandle(owner);

    if (customSlung) {
      const slugRegex = /^[a-zA-Z0-9-_]+$/;

      if (!slugRegex.test(customSlung)) {
        return res.status(400).json({
          message: "Custom slug can contain only letters, numbers, hyphens and underscores",
        });
      }

      const slugExists = await Url.findOne({ userId, customSlung });
      if (slugExists) {
        return res.status(409).json({ message: "You already have a link with this slug" });
      }
    } else {
      let isUnique = false;

      while (!isUnique) {
        customSlung = generateShortCode();
        const exists = await Url.findOne({ userId, customSlung });
        if (!exists) isUnique = true;
      }
    }

    const host = (process.env.HOST || "").replace(/\/+$/, "");
    const shortUrl = `${host}/r/${handle}/${customSlung}`;

    const url = new Url({
      userId,
      originalUrl,
      customSlung,
      shortUrl,
      createdAt: new Date(),
    });

    await url.save();

    res.status(201).json({ success: true, shortUrl });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "You already have a link with same slug" });
    }

    console.log("Error while generating Short Url:", error.message);
    res.status(500).json({ message: "Can't generate short URL" });
  }
};

const getShortUrlDetails = async (req, res) => {
  try {
    const userId = req.user.userId;

    let page = parseInt(req.query.page, 10);
    let limit = parseInt(req.query.limit, 10);

    if (!Number.isInteger(page) || page < 1) page = 1;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) limit = 10;

    const skip = (page - 1) * limit;

    const totalLinks = await Url.countDocuments({ userId });

    const links = await Url.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalLinks / limit);

    res.status(200).json({
      success: true,
      links,
      pagination: {
        currentPage: page,
        limit,
        totalLinks,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.log("ERROR while fetching shortUrl details:", error.message);
    res.status(500).json({ message: "Can't fetch URL details. Try again later" });
  }
};

const removeShortUrl = async (req, res) => {
  try {
    const { customSlung } = req.params;
    const userId = req.user.userId;

    const response = await Url.findOneAndDelete({ customSlung, userId });

    if (!response) {
      return res.status(404).json({ message: "URL not found" });
    }

    await Analytics.deleteOne({ customSlung, userId });

    res.status(200).json({ message: `Deleted ${customSlung} link` });
  } catch (error) {
    console.log("ERROR while removing Url:", error.message);
    res.status(500).json({ message: "Can't remove URL. Try again later" });
  }
};

const redirectToOriginal = async (req, res) => {
  try {
    const { handle, customSlung } = req.params;

    let url;
    let userId;

    if (handle && customSlung) {
      const owner = await User.findOne({ handle }).select("_id");
      if (!owner) {
        return res.status(404).json({ message: "URL not found" });
      }
      userId = String(owner._id);
      url = await Url.findOne({ userId, customSlung });
    } else {
      const slug = customSlung || handle;
      url = await Url.findOne({ customSlung: slug });
      if (url) {
        userId = String(url.userId);
      }
    }

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    const actualSlug = customSlung || handle;

    try {
      const bucket = getDeviceBucket(req.get("User-Agent") || "");

      await Analytics.findOneAndUpdate(
        { userId, customSlung: actualSlug },
        {
          $inc: { totalClicks: 1, [`deviceDistribution.${bucket}`]: 1 },
          $set: { lastClickTimeStamp: new Date() },
        },
        { upsert: true, setDefaultsOnInsert: true }
      );
    } catch (analyticsError) {
      console.log("ERROR while recording click:", analyticsError.message);
    }

    return res.redirect(302, url.originalUrl);
  } catch (error) {
    console.log("ERROR while redirecting URL:", error.message);
    res.status(500).json({ message: "Can't redirect URL. Try again later" });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const analytics = await Analytics.find({ userId });

    res.status(200).json(analytics);
  } catch (error) {
    console.log("Error while fetching analytics:", error.message);
    res.status(500).json({ message: "Not able to fetch analytics" });
  }
};

module.exports = {
  generateShortUrl,
  getShortUrlDetails,
  removeShortUrl,
  redirectToOriginal,
  getAnalytics,
};