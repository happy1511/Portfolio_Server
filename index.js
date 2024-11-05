// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const adminRoutes = require("./api/admin/route.js");
const websiteRoutes = require("./api/website/routes.js");
const connectDB = require("./config/mongo/mongo.js");
const path = require("path");

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

connectDB();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors());
app.use((req, res, next) => {
  console.log(req.url);
  next();
});
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use("/admin", adminRoutes);
app.use("/", websiteRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`http://localhost:${port}`);
});
