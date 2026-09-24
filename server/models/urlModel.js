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

const Url = mongoose.model("Url", urlSchema);

module.exports = Url;