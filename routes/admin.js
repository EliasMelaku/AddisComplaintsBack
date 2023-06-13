const express = require("express");
const crypto = require("crypto");
const db = require("../models");

require("dotenv").config();
const jwt = require("jsonwebtoken");
const { authenticate } = require("../middleware/authenticate");

const router = express.Router();

router.get("/getAllUsers", authenticate("admin"), async (req, res, next) => {
  try {
    const users = await db.User.findAll({
      attributes: ["id", "name", "email", "role", "isBanned"],
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/getAllFeedback", authenticate("admin"), async (req, res, next) => {
  try {
    const feedbacks = await db.Feedback.findAll({
      attributes: ["id", "name", "email", "comment", "pdf"],
    });

    res.status(200).json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put(
  "/banUser/:userId",
  authenticate("admin"),
  async (req, res, next) => {
    try {
      const user = await db.User.findOne({
        where: { id: req.params.userId },
      });
      if (user) {
        user.update({ isBanned: true });
        await user.save();
        console.log(user);
        res.status(200).json({ message: "User banned!" });
      } else {
        res.status(404).json({ message: "User not found!" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);
router.post(
  "/deleteComment",
  authenticate("admin"),
  async (req, res, next) => {}
);

module.exports = router;
