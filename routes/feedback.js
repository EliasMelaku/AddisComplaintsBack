const express = require("express");
const crypto = require("crypto");
const db = require("../models");
// const { DataTypes } = require("sequelize");
// const Feedback = require("../models/feedback")(db.sequelize, DataTypes);

require("dotenv").config();
const jwt = require("jsonwebtoken");
const { authenticate } = require("../middleware/authenticate");

const router = express.Router();

router.get("/", authenticate("user"), async (req, res, next) => {
  try {
    const feedbacks = await db.Feedback.findAll({
      where: { email: req.user.email },
    });
    console.log(feedbacks);
  } catch {
    (err) => console.log(err);
  }
});

router.post("/create", async (req, res, next) => {
  // console.log(req.files);
  let uploadFile = req.files.pdf;
  const fileName = ("../" + uploadFile.name).toString();

  if (fileName.includes("/")) {
    res.status(400).send("Error with filename");
  }
  // console.log(fileName);
  // res.send("success");
  else {
    uploadFile.mv(`${__dirname}/../../${fileName}`, function (err) {
      if (err) {
        return res.status(500).send(err);
      }
      res.json({
        file: `public/${req.files.pdf.name}`,
      });
    });
  }
});

router.put("/update/:id", async (req, res, next) => {
  res.send("Feedback Updated");
});

router.delete("/delete/:id", authenticate("user"), async (req, res, next) => {
  res.send("Feedback Deleted");
});

module.exports = router;
