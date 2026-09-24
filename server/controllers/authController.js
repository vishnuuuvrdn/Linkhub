const bcrypt = require("bcrypt");
const { User, EmailVerification } = require("../models/userModel");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const generateTokens = require("../middlewares/tokenGenerator");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const exists = await User.findOne({ email });

    if (exists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
    });

    await user.save();

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
    };

    res.status(201).json({ 
      message: "User registered successfully",
      user: userResponse,
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
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
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        message: "No refresh token",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const accessToken = jwt.sign(
      {
        userId: decoded.userId,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      },
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      message: "Access token refreshed",
    });
  } catch (error) {
    console.log(error.message);

    res.status(401).json({
      message: "Invalid or expired refresh token",
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, redirectLink } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "LinkHub Email Verification",
      text: "Verify your email",
      html: `
        <h1>Verify Email</h1>
        <p>Click the link below to verify your email.</p>
        <a href="${redirectLink}?token=${token}&email=${encodeURIComponent(email)}">
          Verify Email
        </a>
      `,
    });

    await EmailVerification.deleteMany({
      userId: user._id,
    });

    const emailVerification = new EmailVerification({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    await emailVerification.save();

    res.status(200).json({
      message: "Verification link sent",
    });
  } catch (error) {
    console.log("Error while sending mail:", error.message);

    res.status(500).json({
      message: "Unable to send verification email",
    });
  }
};

const verifyToken = async (req, res) => {
  try {
    const { email, token, passReset } = req.body;

    if (!email || !token) {
      return res.status(400).json({
        message: "Email and token are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const tokenVerify = await EmailVerification.findOne({
      userId: user._id,
      tokenHash,
      expiresAt: {
        $gt: new Date(),
      },
    });

    if (!tokenVerify) {
      return res.status(400).json({
        message: passReset
          ? "Token expired or invalid. Try again."
          : "Token expired or invalid. Verify your email again.",
      });
    }

    await EmailVerification.findByIdAndDelete(tokenVerify._id);

    if (passReset) {
      user.resetPassword = true;
      await user.save();

      return res.status(200).json({
        message: "You can now reset your password.",
      });
    }

    user.emailVerified = true;

    await user.save();

    res.status(200).json({
      message: "Your email was verified successfully.",
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, redirectLink } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: "If the email exists, a password reset link has been sent.",
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await EmailVerification.deleteMany({
      userId: user._id,
    });

    await EmailVerification.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "LinkHub Password Reset",
      text: "Reset your password",
      html: `
        <h1>Reset Password</h1>
        <p>Click the link below to reset your password.</p>
        <a href="${redirectLink}?token=${token}&email=${encodeURIComponent(email)}">
          Reset Password
        </a>
      `,
    });

    res.status(200).json({
      message: "If the email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.log("Error while sending reset email:", error.message);

    res.status(500).json({
      message: "Unable to process password reset request",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        message: "Email and new password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.resetPassword) {
      return res.status(400).json({
        message: "You can't reset password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPassword = false;

    await user.save();

    res.status(200).json({
      message: "Your password was reset successfully",
    });
  } catch (error) {
    console.log("Error from resetPassword:", error.message);

    res.status(500).json({
      message: "Try resetting your password later",
    });
  }
};

module.exports = {
  register,
  login,
  refresh,
  verifyEmail,
  verifyToken,
  forgotPassword,
  resetPassword,
};
