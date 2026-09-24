const Url = require("../models/urlModel")
const { User } = require("../models/userModel")
const crypto = require("crypto")
require("dotenv").config()

const generateShortUrl = async(req, res) => {
    try{
        const { originalUrl } = req.body;
        let {customSlung} = req.body;

        if(!customSlung){
            customSlung = crypto.randomBytes(3).toString('hex');
        }

        const slungExist = await Url.findOne({customSlung});
        const urlExist = await Url.findOne({ originalUrl });

        if (urlExist) {
          return res
            .status(400)
            .json({
              message: "This url is already exist Database.",
              shortUrl: urlExist.shortUrl,
            });
        }

        if(slungExist){
            customSlung = crypto.randomBytes(3).toString("hex");
        }

        const shortUrl = process.env.HOST + "/r/" + customSlung

        const url = new Url({
            userId: req.user.userId,
            originalUrl,
            customSlung,
            shortUrl,
            createdAt: new Date(Date.now())
        })

        await url.save();

        res.status(201).json({ success : true, shortUrl : shortUrl })
    }
    catch(err){
        console.log("Error while generating Short Url:", err.message);
        res.status(500).json({message: "Cant't generate Short Url."})
    }
}

const getShortUrlDetails = async (req, res) => {
    try{
        const userId = req.user.userId;

        const response = await Url.find({userId});

        res.status(200).json(response);
    }
    catch(err){
        console.log("ERROR while fetching shortUrl details Url:", err.message);
        res.json(500).json({ message: "Can't fetch Url details. Try again later" });
    }

}

const removeShortUrl = async (req, res) => {
    try{
        const customSlung = req.params.customSlung;

        const response = await Url.findOneAndDelete({customSlung});
        if (!response) {
          return res.status(404).json({ message: "Url not found" });
        }

        res.status(200).json({message: `Deleted ${customSlung} link`,response})
    }
    catch(err){
        console.log("ERROR while removing Url:", err.message);
        res.json(500).json({message : "Can't Remove Url. Try again later"})
    }
}

const getOriginalUrl = async (req, res) => {
    try{
        const customSlung = req.params.customSlung;

        const response = await Url.findOne({customSlung});
        if(!response){
            return res.status(404).json({message: "Url not found"})
        }

        res.status(200).json({ originalUrl : response.originalUrl });
    }
    catch(err){
        console.log("ERROR while fetching originalUrl:", err.message);
        res.json(500).json({ message: "Can't fetch originalUrl. Try again later" });
    }
}

module.exports = { generateShortUrl, getShortUrlDetails, removeShortUrl, getOriginalUrl }