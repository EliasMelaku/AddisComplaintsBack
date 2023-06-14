require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

// import the different routes for Auth
const auth = require("./routes/auth");
const feedback = require("./routes/feedback");
const admin = require("./routes/admin");
const fileUpload = require("express-fileupload");

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

app.use(express.json({ extended: false }));

// Setup CORS

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
// setup cookie parser
app.use(cookieParser());

//setup file upload
app.use(fileUpload());

app.use(function (req, res, next) {
  res.header("Content-Type", "application/json;charset=UTF-8");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Routes

// Handle Auth related routes
app.use("/api/auth", auth);
app.use("/api/feedback", feedback);
app.use("/api/admin", admin);

app.get(["/", "/home"], (req, res) => {
  res.send("This is the landing page");
});

app.listen(8080, () => {
  console.log("Server Running on Port: 8080");
});
