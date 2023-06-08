const express = require("express");
const crypto = require("crypto");
const db = require("../models");
const { DataTypes } = require("sequelize");
const User = require("../models/user")(db.sequelize, DataTypes);

require("dotenv").config();
const jwt = require("jsonwebtoken");
const { authenticate } = require("../middleware/authenticate");

const router = express.Router();

router.post(
  "/getAllUsers",
  authenticate("admin"),
  async (req, res, next) => {}
);

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
