const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name : String,
    email : {
        type: String,
        unique: true
    },
    emailVerified : Boolean,
    password : String,
    resetPassword : {
      type: Boolean,
      default: false
    },
});

const User = mongoose.model("User", userSchema);

const emailVerificationSchema = new Schema({
  userId: {
    type: String,
    ref: "User",
    required: true,
    unique: true,
  },

  tokenHash: {
    type: String,
    required: true,
    unique: true,
  },

  expiresAt: {
    type: Date,
    required: true,
    index: true,
    expires: 0,
  },
});

const EmailVerification = mongoose.model("EmailVerification", emailVerificationSchema);

module.exports = {User, EmailVerification}