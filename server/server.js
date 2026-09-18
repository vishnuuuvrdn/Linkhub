const express = require("express");
const app = express();
const connectDb = require('./db');
connectDb();
const cookieParser = require('cookie-parser');

const authRoutes = require("./routes/authRoutes");

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.send("API Working"));
app.use("/api/auth", authRoutes);

app.listen(5000, () => {
    console.log("Server running on PORT 5000");
});