const express = require("express");
const crypto = require("crypto");
const db = require("../models");
// const { DataTypes } = require("sequelize");
// const User = require("../models/user")(db.sequelize, DataTypes);
// const axios = require("axios");

require("dotenv").config();
const jwt = require("jsonwebtoken");

const { checkCaptcha } = require("../middleware/checkCaptcha");

const router = express.Router();

router.post("/login", async (req, res, next) => {
  ////Destructuring response token and input field value from request body
  const token = req.body.token;
  // console.log(token);
  try {
    // Sending secret key and response token to Google Recaptcha API for authentication.
    // const response = await axios.post(
    //   `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET_KEY}&response=${token}`
    // );
    const response = await checkCaptcha(token);

    // Check response status and send back to the client-side
    if (response === true) {
      const possibleUser = await db.User.findOne({
        where: { email: req.body.email },
      });
      if (possibleUser) {
        crypto.pbkdf2(
          req.body.password,
          possibleUser.passwordSalt,
          310000,
          32,
          "sha256",
          async function (err, hashedPassword) {
            if (err) {
              return err.message;
            }
            if (
              !crypto.timingSafeEqual(possibleUser.passwordHash, hashedPassword)
            ) {
              res.status(401).json("Incorrect Email or Password");
            }
            // if (possibleUser.emailConfirmed === false) {
            //   res
            //     .status(401)
            //     .send("You need to confirm your email before continuing ");
            // }
            try {
              const secret = process.env.JWT_SECRET + possibleUser.passwordHash;
              const payload = {
                id: possibleUser.id,
                email: possibleUser.email,
                role: possibleUser.role,
              };
              const userPayLoad = {
                email: possibleUser.email,
                role: possibleUser.role,
                name: possibleUser.name,
              };

              const access_token = jwt.sign(payload, secret, {
                expiresIn: "1d",
              });
              // const signIn_token = jwt.sign(payload, secret, {
              //   expiresIn: "2h",
              // });
              res
                .cookie("access_token", access_token, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === "production",
                })
                .cookie("userId", possibleUser.id, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === "production",
                })
                .status(200)
                .send({ name: possibleUser.name, email: possibleUser.email });

              // res.send(role[0].role);
            } catch (err) {
              console.log(err.message);
              // return res.send(err.message);
            }
          }
        );
      } else {
        res
          .status(404)
          .json("We couldn't find an account with the provided Email");
      }
    } else {
      res.status(401).send("Robot 🤖");
      // res.send(token);
    }
  } catch (error) {
    // Handle any errors that occur during the reCAPTCHA verification process
    console.error(error);
    res.status(500).send("Error verifying reCAPTCHA");
  }
});

router.post("/register", async (req, res, next) => {
  // const token = req.body.token;
  // console.log(token);
  try {
    // Sending secret key and response token to Google Recaptcha API for authentication.
    // const response = await axios.post(
    //   `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET_KEY}&response=${token}`
    // );

    // Check response status and send back to the client-side
    if (true || response.data.success) {
      var salt = crypto.randomBytes(16);
      crypto.pbkdf2(
        req.body.password,
        salt,
        310000,
        32,
        "sha256",
        async function (err, hashedPassword) {
          if (err) {
            return next(err);
          }
          try {
            const createdUser = await db.User.create({
              // username: req.body.username,
              email: req.body.email,
              name: req.body.name,
              passwordHash: hashedPassword,
              passwordSalt: salt,
            });
            await createdUser.save();

            const secret = process.env.JWT_SECRET + createdUser.passwordHash;
            const payload = {
              email: createdUser.email,
              id: createdUser.id,
              role: req.body.role,
            };
            const access_token = jwt.sign(payload, secret, { expiresIn: "1d" });
            res
              .cookie("access_token", access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
              })
              .status(200)
              .send({ name: createdUser.name, email: createdUser.email });
          } catch (err) {
            return res.status(409).json(err);
          }
        }
      );
    } else {
      res.status(401).send("Robot 🤖");
      // res.send(token);
    }
  } catch (error) {
    // Handle any errors that occur during the reCAPTCHA verification process
    console.error(error);
    res.status(500).send("Error verifying reCAPTCHA");
  }
});

router.post("/logout", (req, res, next) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  res.end();
});

module.exports = router;
