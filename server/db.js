const mongoose = require('mongoose');
require('dotenv').config();

const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const connectDb = async () =>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB Connected.");
    }catch(err){
        console.log(err.message);
        process.exit(1);
    }
}

module.exports = connectDb;