const express = require("express");
const crypto = require("crypto");
const db = require("../models");
// const { DataTypes } = require("sequelize");
// const Feedback = require("../models/feedback")(db.sequelize, DataTypes);

require("dotenv").config();
const jwt = require("jsonwebtoken");
const { authenticate } = require("../middleware/authenticate");

const router = express.Router();

router.post("/", authenticate("user"), async (req, res, next) => {
  try {
    const feedbacks = await db.Feedback.findAll({
      where: { email: req.user.email },
    });
    res.send(feedbacks);
  } catch {
    (err) => console.log(err);
  }
});

router.post("/create", async (req, res, next) => {
  // console.log(req.files);
  let uploadFile = req.files.pdf;
  // console.log(uploadFile);
  const name = uploadFile.name.split(".")[0];
  const extension = uploadFile.name.split(".")[1];
  const fileName = (name + Date.now() + "." + extension).toString();
  // console.log(fileName);

  if (fileName.includes("/") || fileName.includes("\\")) {
    res.status(400).send("Error with filename");
  }
  // console.log(fileName);
  // res.send("success");
  else {
    uploadFile.mv(`${__dirname}/../public/${fileName}`, function (err) {
      if (err) {
        return res.status(500).send(err);
      }
    });
    const createdUser = await db.Feedback.create({
      // username: req.body.username,
      email: req.body.email,
      name: req.body.name,
      comment: req.body.comment,
      pdf: fileName,
    });
    const status = await createdUser.save();
    if (status) {
      res.send("WooHoo");
    }
  }
});

router.put("/update/:id", async (req, res, next) => {
  res.send("Feedback Updated");
});

router.delete("/delete/:id", authenticate("user"), async (req, res, next) => {
  res.send("Feedback Deleted");
});

module.exports = router;
