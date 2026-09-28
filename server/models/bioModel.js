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
  }
});

const Bio = mongoose.model("Bio", bioSchema);

module.exports = Bio;