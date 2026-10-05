const { Url, Analytics } = require("../models/urlModel");
const crypto = require("crypto");
require("dotenv").config();
const {UAParser} = require('ua-parser-js')

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

    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (page < 1) {
      page = 1;
    }

    if (limit < 1 || limit > 100) {
      limit = 10;
    }

    const skip = (page - 1) * limit;

    const totalLinks = await Url.countDocuments({
      userId,
    });

    const links = await Url.find({
      userId,
    })
    .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalLinks / limit);

    res.status(200).json({ success: true, links, pagination: {
        currentPage: page,
        limit,
        totalLinks,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.log(
      "ERROR while fetching shortUrl details:",
      error.message
    );

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

const redirectToOriginal = async (req, res) => {
  try {
    const { customSlung } = req.params;
    const userAgent = req.get("User-Agent") || "";
    const parser = new UAParser(userAgent);
    const parserResult = parser.getResult();
    const lastClickTimeStamp = new Date();

    const url = await Url.findOne({
      customSlung,
    });

    if (!url) {
      return res.status(404).json({
        message: "URL not found",
      });
    }

    let analytics = await Analytics.findOne({customSlung});

    if(!analytics){
      analytics = new Analytics({
        userId : url.userId,
        customSlung,
        totalClicks: 0,
        lastClickTimeStamp,
        deviceDistribution: {
          Mobile: 0,
          Desktop: 0,
          Other: 0
        },
      });
    }

    const os = parserResult.os.name;
    if(os == 'Windows' || os == 'Linux' || os == 'macOs'){
      analytics.deviceDistribution.Desktop++;
    }else if(os == 'iOS' || os == 'Android'){
      analytics.deviceDistribution.Mobile++;
    }else{
      analytics.deviceDistribution.Other++;
    }

    analytics.totalClicks++;
    analytics.lastClickTimeStamp = lastClickTimeStamp;
    await analytics.save();

    return res.redirect(302, url.originalUrl);
  } catch (error) {
    console.log("ERROR while redirecting URL:", error.message);

    res.status(500).json({
      message: "Can't redirect URL. Try again later",
    });
  }
};

const getAnalytics = async (req, res) => {
  try{
    const userId = req.user.userId;
    const analytics = await Analytics.find({ userId });

    if(analytics.length == 0){
      return res.status(500).json({message : `No one Clicked Your Urls yet.`})
    }

    res.status(200).json(analytics);
  }
  catch(error){
    console.log("Error while fetching analytics:", error.message);
    res.status(500).json({mesaage: "Not able fetch analytics"})
  }
}

module.exports = {
  generateShortUrl,
  getShortUrlDetails,
  removeShortUrl,
  redirectToOriginal,
  getAnalytics,
};
