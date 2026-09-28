const mongoose = require('mongoose');
const { Schema } = mongoose;

const urlSchema = new Schema({
    userId : String,
    originalUrl : String,
    customSlung : {
        type: String,
        unique: true
    },
    shortUrl : String,
    createdAt : Date
});

const analyticsSchema = new Schema({
  userId : String,
  customSlung: {
    type: String,
    unique: true,
  },
  totalClicks: Number,
  lastClickTimeStamp: Date,
  deviceDistribution: {
    Mobile: Number,
    Desktop: Number,
    Other : Number
  },
});

const Url = mongoose.model("Url", urlSchema);
const Analytics = mongoose.model("Analytics", analyticsSchema)

module.exports = { Url, Analytics};