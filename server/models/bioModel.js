const mongoose = require('mongoose');
const { Schema } = mongoose;

const bioSchema = new Schema({
  userId: String,
  username: {
    type: String,
    unique: true
  },
  avatar: String,
  displayName: String,
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
    instagram: String,
  },
  customLinks: [{
    _id: false,
    title: { type: String, trim: true, maxlength: 40 },
    url: { type: String, required: true, trim: true },
    icon: { type: String, default: "link" },
  }],
});

const Bio = mongoose.model("Bio", bioSchema);

module.exports = Bio;