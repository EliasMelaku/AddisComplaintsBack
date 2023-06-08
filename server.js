require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

// import the different routes for Auth
const auth = require("./routes/auth");
const feedback = require("./routes/feedback");
const fileUpload = require("express-fileupload");

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

app.get(["/", "/home"], (req, res) => {
  res.send("This is the landing page");
});

app.listen(5000, () => {
  console.log("Server Running on Port: 5000");
});
