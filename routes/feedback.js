const express = require("express");
const crypto = require("crypto");
const db = require("../models");
// const { DataTypes } = require("sequelize");
// const Feedback = require("../models/feedback")(db.sequelize, DataTypes);
const fileSystem = require("fs");

require("dotenv").config();
const jwt = require("jsonwebtoken");
const { authenticate } = require("../middleware/authenticate");

const csrf = require("@dr.pogodin/csurf");

const csrfProtection = csrf({ cookie: true });

const router = express.Router();

router.get("/csrf-token", csrfProtection, (req, res, next) => {
  // res.clearCookie("_csrf")
  // res.send({ csrfToken: req.csrfToken });
  res.cookie("XSRF-TOKEN", req.csrfToken()).status(200).send("Csrf-protected");
});

router.post("/clear", csrfProtection, (req, res, next) => {
  // res.send("You passed the csrfCheck");
  res.clearCookie("XSRF-TOKEN").status(200).send("");
});

router.post("/single", authenticate("user"), async (req, res, next) => {
  // console.log(req.body.id);
  try {
    const feedback = await db.Feedback.findOne({
      where: { id: req.body.id },
    });
    if (feedback.pdf !== null) {
      feedback.pdf = feedback.pdf.split("~~")[0];
    }
    res.send(feedback);
  } catch {
    (err) => console.log(err);
  }
});

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

router.post(
  "/create",
  authenticate("user"),
  csrfProtection,
  async (req, res, next) => {
    // console.log(req.files);
    let uploadFile;
    if (req.files !== null) {
      uploadFile = req.files.pdf;
      const name = uploadFile.name.split(".")[0];
      const extension = uploadFile.name.split(".")[1];
      const fileName = (name + "~~" + Date.now() + "." + extension).toString();

      if (fileName.includes("/") || fileName.includes("\\")) {
        res.status(400).send("Error with filename");
      } else {
        uploadFile.mv(`${__dirname}/../pdfs/${fileName}`, async function (err) {
          if (err) {
            return res.status(500).send(err);
          } else {
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
      }
    } else {
      const createdUser = await db.Feedback.create({
        // username: req.body.username,
        email: req.user.email,
        name: req.user.name,
        comment: req.body.comment,
      });
      const status = await createdUser.save();
      if (status) {
        res.send("WooHoo");
      }
    }
    // console.log(uploadFile);

    // console.log(fileName);

    // console.log(fileName);
    // res.send("success");
  }
);

router.put("/update", async (req, res, next) => {
  let uploadFile;
  if (req.files !== null) {
    uploadFile = req.files.pdf;
    const name = uploadFile.name.split(".")[0];
    const extension = uploadFile.name.split(".")[1];
    const fileName = (name + "~~" + Date.now() + "." + extension).toString();

    if (fileName.includes("/") || fileName.includes("\\")) {
      res.status(400).send("Error with filename");
    } else {
      const updatableUser = await db.Feedback.findOne({
        where: { id: req.body.id },
      });
      if (updatableUser.pdf !== null) {
        var fileToBeReplaced = `${__dirname}/../pdfs/${updatableUser.pdf}`;
        // console.log(fileToBeReplaced);
        fileSystem.unlink(fileToBeReplaced, (err) => {
          console.log(err);
        });
      }
      uploadFile.mv(`${__dirname}/../pdfs/${fileName}`, function (err) {
        if (err) {
          return res.status(500).send(err);
        }
      });

      updatableUser.update({
        comment: req.body.comment,
        pdf: fileName,
      });
      // const createdUser = await db.Feedback.create({
      //   // username: req.body.username,
      //   email: req.body.email,
      //   name: req.body.name,
      //   comment: req.body.comment,
      //   pdf: fileName,
      // });
      const status = await updatableUser.save();
      if (status) {
        res.send("WooHoo");
      }
    }
  } else {
    const updatableUser = await db.Feedback.findOne({
      id: req.body.id,
    });
    updatableUser.update({
      comment: req.body.comment,
    });

    const status = await updatableUser.save();
    if (status) {
      res.send("WooHoo");
    }
  }
});

router.delete("/:id", async (req, res, next) => {
  // console.log(req.body);
  const deletableFeedback = await db.Feedback.findOne({
    where: { id: req.params.id },
  });

  if (deletableFeedback.pdf !== null) {
    var fileToBeReplaced = `${__dirname}/../pdfs/${deletableFeedback.pdf}`;
    // console.log(fileToBeReplaced);
    fileSystem.unlink(fileToBeReplaced, async (err) => {
      if (err) {
        console.log(err);
        res.status(500).send("Something Went Wrong");
      } else {
        // await db.Feedback.destory({
        //   where: { id: req.params.id },
        // });
        deletableFeedback.destroy();
        res.status(204).send("Feedback Deleted");
      }
    });
  } else {
    deletableFeedback.destroy();
    res.status(204).send("Feedback Deleted");
  }

  // await deletableFeedback.save();
});

router.get(
  "/file/:feedbackId",
  authenticate("admin"),
  async (req, res, next) => {
    const { feedbackId } = req.params;
    const feedback = await db.Feedback.findOne({
      where: { id: feedbackId },
    });

    if (feedback === null) {
      res.status(404).send("No such feedback");
    }
    console.log(feedback);
    var fileToSend = `${__dirname}/../pdfs/${feedback.pdf}`;
    const file = fileSystem.readFile(fileToSend, (err, myFile) => {
      if (err) {
        console.log(err);
      } else {
        res
          .setHeader("Content-Type", "application/pdf")
          .setHeader(
            "Content-Disposition",
            `attachment; filename=${feedback.pdf.split("~~")[0]}.pdf`
          )
          .status(201)
          .send(myFile);
      }
    });
  }
);

module.exports = router;
``;
