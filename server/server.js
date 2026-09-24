const express = require("express");
const app = express();
const connectDb = require('./db');
connectDb();
const cookieParser = require('cookie-parser');

const authRoutes = require("./routes/authRoutes");
const urlRoutes = require("./routes/urlRoutes");
const { getOriginalUrl } = require("./controllers/urlController");

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.send("API Working"));
app.use("/api/auth", authRoutes);
app.use("/api/links", urlRoutes);

app.get("/r/:customSlung", getOriginalUrl)

app.listen(5000, () => {
    console.log("Server running on PORT 5000");
});