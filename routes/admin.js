const express = require("express");
const crypto = require("crypto");
const db = require("../models");
const { DataTypes } = require("sequelize");
const User = require("../models/user")(db.sequelize, DataTypes);

require("dotenv").config();
const jwt = require("jsonwebtoken");
const { authenticate } = require("../middleware/authenticate");

const router = express.Router();

router.get("/getAllUsers", authenticate("admin"), async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post(
  "/getAllFeedback",
  authenticate("admin"),
  async (req, res, next) => {}
);

router.post("/banUser", authenticate("admin"), async (req, res, next) => {});
router.post(
  "/deleteComment",
  authenticate("admin"),
  async (req, res, next) => {}
);

module.exports = router;
