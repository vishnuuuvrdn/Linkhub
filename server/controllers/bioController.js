const Bio = require('../models/bioModel')

const updateBio = async (req, res) => {
    try {
        const userId = req.user.userId;
        let userBio = await Bio.findOne({ userId });

        if(!userBio){
            const username = req.body.username;
            if(!username){
                return res.status(400).json({message: "username required"})
            }
            const displayName = req.body.displayName;
            userBio = new Bio({
                userId,
                username,
                displayName,
            })
        }

        const github = req.body.github;
        if(github){
            userBio.socialLinks.github = github;
        }

        const linkedin = req.body.linkedin;
        if(linkedin){
            userBio.socialLinks.linkedin = linkedin;
        }

        const twitter = req.body.twitter;
        if(twitter){
            userBio.socialLinks.twitter = twitter;
        }

        const instagram = req.body.instagram;
        if(instagram){
            userBio.socialLinks.instagram = instagram;
        }

        await userBio.save();

        const response = req.body

        res.status(200).json({message : "Successfully updated your bio.", response})

    } catch (error) {
        console.log("Error while updating bio:", error.message)
        res.status(500).json({message: "Cannot update bio now, Try again later."})
    }
}


const getBio = async (req, res) => {
    try {
        const { username } = req.params;
        const userBio = await Bio.findOne({username});
        if(!userBio){
            return res.status(404).json({message: "User does not have any bio, User should update their bio"});
        }

        const displayName = userBio.displayName
        const socialLinks = userBio.socialLinks

        const response = {username, displayName, socialLinks}
        res.status(200).json(response);
    } catch (error) {
        console.log("Error while fetching bio:", error.message);
        res.status(500).json({ message: "Cannot fetch bio now, Try again later." });
    }
}


module.exports = { updateBio, getBio }