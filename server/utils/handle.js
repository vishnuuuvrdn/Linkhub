const crypto = require("crypto");
const { User } = require("../models/userModel");

const generateHandle = async () => {
    for (let i = 0; i < 10; i++) {
        const handle = crypto.randomBytes(3).toString("hex");
        if (!(await User.exists({ handle }))) return handle;
    }
    return crypto.randomBytes(5).toString("hex");
};

const ensureHandle = async (user) => {
    if (!user.handle) {
        user.handle = await generateHandle();
        await user.save();
    }
    return user.handle;
};

module.exports = { generateHandle, ensureHandle };