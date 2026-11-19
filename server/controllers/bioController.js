const mongoose = require('mongoose');
const Bio = require('../models/bioModel');
const { User } = require('../models/userModel');

const findBioForUser = async (userId, userDoc = null, targetUsername = null) => {
    if (!userId && !targetUsername) return null;
    const idStr = userId ? String(userId) : "";
    const orList = [];
    if (idStr) {
        orList.push({ userId: idStr });
        if (mongoose.Types.ObjectId.isValid(idStr)) {
            orList.push({ userId: new mongoose.Types.ObjectId(idStr) });
        }
    }

    const user = userDoc || (mongoose.Types.ObjectId.isValid(idStr) ? await User.findById(idStr) : null);
    if (user && user.handle) {
        orList.push({ username: user.handle });
    }

    if (targetUsername && typeof targetUsername === 'string' && targetUsername.trim()) {
        orList.push({ username: targetUsername.trim() });
    }

    if (orList.length === 0) return null;

    let bio = await Bio.findOne({ $or: orList });

    if (bio) {
        let bioModified = false;
        if (!bio.userId || bio.userId.toString() !== idStr) {
            bio.userId = idStr;
            bioModified = true;
        }
        if (bioModified) {
            await bio.save().catch(() => { });
        }

        if (user && (!user.handle || user.handle !== bio.username)) {
            user.handle = bio.username;
            await user.save().catch(() => { });
        }
    }

    return bio;
};

const updateBio = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        const submittedUsername = (req.body.username || "").trim();
        let userBio = await findBioForUser(userId, user, submittedUsername);

        if (!userBio) {
            if (!submittedUsername) {
                return res.status(400).json({ message: "username required" });
            }
            const displayName = req.body.displayName || (user ? user.name : "");
            userBio = new Bio({
                userId: String(userId),
                username: submittedUsername,
                displayName,
                socialLinks: {},
                customLinks: [],
            });
        }

        if (req.body.displayName !== undefined) {
            userBio.displayName = req.body.displayName;
        }

        if (!userBio.socialLinks) {
            userBio.socialLinks = {};
        }

        if (req.body.github !== undefined) {
            userBio.socialLinks.github = req.body.github;
        }
        if (req.body.linkedin !== undefined) {
            userBio.socialLinks.linkedin = req.body.linkedin;
        }
        if (req.body.twitter !== undefined) {
            userBio.socialLinks.twitter = req.body.twitter;
        }
        if (req.body.instagram !== undefined) {
            userBio.socialLinks.instagram = req.body.instagram;
        }

        if (Array.isArray(req.body.customLinks)) {
            userBio.customLinks = req.body.customLinks
                .filter((l) => l && typeof l.url === "string" && l.url.trim())
                .map((l) => ({
                    title: (l.title || "").trim().slice(0, 40),
                    url: l.url.trim(),
                    icon: l.icon || "link",
                }));
            userBio.markModified("customLinks");
        }

        await userBio.save();

        if (user && userBio.username) {
            user.handle = userBio.username;
            await user.save().catch(() => { });
        }

        const response = {
            username: userBio.username,
            displayName: userBio.displayName,
            socialLinks: userBio.socialLinks,
            customLinks: userBio.customLinks,
        };

        res.status(200).json({ message: "Successfully updated your bio.", response });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Username is already taken" });
        }
        console.log("Error while updating bio:", error.message);
        res.status(500).json({ message: "Cannot update bio now, Try again later." });
    }
};

const getBio = async (req, res) => {
    try {
        const { username } = req.params;
        const userBio = await Bio.findOne({ username });
        if (!userBio) {
            return res.status(404).json({ message: "User does not have any bio, User should update their bio" });
        }

        const displayName = userBio.displayName;
        const socialLinks = userBio.socialLinks || {};
        const customLinks = userBio.customLinks || [];

        const response = { username, displayName, socialLinks, customLinks };
        res.status(200).json(response);
    } catch (error) {
        console.log("Error while fetching bio:", error.message);
        res.status(500).json({ message: "Cannot fetch bio now, Try again later." });
    }
};

const getMyBio = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        const userBio = await findBioForUser(userId, user);

        if (!userBio) {
            if (user) {
                return res.status(200).json({
                    username: user.handle || "",
                    displayName: user.name || "",
                    socialLinks: {},
                    customLinks: [],
                    isNew: true,
                });
            }
            return res.status(404).json({ message: "No bio found for this user." });
        }

        const { username, displayName, socialLinks = {}, customLinks = [] } = userBio;
        res.status(200).json({ username, displayName, socialLinks, customLinks, isNew: false });
    } catch (error) {
        console.log("Error while fetching my bio:", error.message);
        res.status(500).json({ message: "Cannot fetch bio now, Try again later." });
    }
};

module.exports = { updateBio, getBio, getMyBio, findBioForUser };