const bcrypt = require("bcrypt");
const { User, EmailVerification } = require("../models/userModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const generateTokens = require("../middlewares/tokenGenerator");
const http = require("http");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({ message: "User Already exist." });
    }

    const user = new User({
      name,
      email,
      verified: false,
      password: hashedPassword,
    });

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(500).json(error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15,
    });

    res.status(200).json({ user });
  } catch (error) {
    console.log(error.message);
    res.status(500).json();
  }
};

const refresh = (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(400).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
};

const verifyEmail = async (req, res) => {

  try {
    const { email, redirectLink } = req.body;
    const user = await User.findOne({ email });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    async function sendEmail(email, redirectLink) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "LinkHub Email Verification",
        text: `Verify Email`,
        html: `<h1>Verify Email</h1>
                  <p>Click the link below to verify your email</p>
                  <a href=${redirectLink}?token=${token}>${redirectLink}</a>`,
      });

      const emailVerification = new EmailVerification({
        userId: user._id,
        tokenHash: tokenHash,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });
      await emailVerification.save();
      res
        .status(200)
        .json({ message: "Check your email, Verification link sent." });
    }

    sendEmail(email, redirectLink);
  } catch (err) {
    console.error("Error while sending mail:", err.message);
  }
};

const verifyToken = async (req, res) => {
  try {
    const { email, token, passReset } = req.body;
    const user = await User.findOne({ email });

    if (user.emailVerified && !passReset) {
      return res.status(200).json({ message: "Email Already Verified." });
    }

    user.emailVerified = true;
    await user.save();

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const tokenVerify = await EmailVerification.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    });

    const userId = user._id;

    if (!tokenVerify) {
      await EmailVerification.findOneAndDelete({ userId });

      if(passReset){
        return res.status(400).json({ message: "Token expired. Try to reset your password again." });
      }

      return res.status(400).json({ message: "Token expired. Verify Email again" });
    }

    await EmailVerification.findOneAndDelete({ userId });

    if(passReset){
      user.password = "";
      user.resetPassword = true;
      await user.save();

      return res.status(200).json({message: "You can now reset your password."});
    }

    res.status(200).json({ message: "Your email verified successfully." });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Internal Error" });
  }
};


const forgotPassword = async (req, res) => {
  try {
    const { email, redirectLink } = req.body;
    const user = await User.findOne({ email });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    async function sendEmail(email, redirectLink) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "LinkHub Password Reset",
        text: `Verify Email`,
        html: `<h1>Reset Password</h1>
                  <p>Click the link below to reset your password</p>
                  <a href=${redirectLink}?token=${token}>${redirectLink}</a>`,
      });

      const emailVerification = new EmailVerification({
        userId: user._id,
        tokenHash: tokenHash,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });
      await emailVerification.save();
      res
        .status(200)
        .json({ message: "Check your email, Password reset link sent." });
    }

    sendEmail(email, redirectLink);
  } catch (err) {
    console.error("Error while sending mail:", err.message);
  }

}

const resetPassword = async (req, res) => {
  try{
    const {email, newPassword} = req.body;

    if(!newPassword){
      return res.status(400).json({message: "Please enter new Password"})
    }

    const user = await User.findOne({email});

    if(!user.resetPassword){
      return res.status(400).json({message : "You can't reset password"});
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPassword = false;
    user.save();

    res.status(201).json({message: "You password reset successfully."})
  }
  catch(err){
    console.log("Error from resetPassword",err.message);
    res.status(500).json({message : "Try reset your password later."})
  }
}

module.exports = { register, login, refresh, verifyEmail, verifyToken, forgotPassword, resetPassword };
