// const { getUserRole } = require("./getUserRole");
const jwt = require("jsonwebtoken");
const db = require("../models");
const { DataTypes } = require("sequelize");
const User = require("../models/user")(db.sequelize, DataTypes);
// const User = require("../database/models/user")(db.sequelize, DataTypes);

function authenticate(role = "any") {
  return async (req, res, next) => {
    // console.log(req.body);
    const possibleUser = await User.findOne({
      where: { id: req.cookies.userId },
    });

    if (possibleUser) {
      const secret = process.env.JWT_SECRET + possibleUser.passwordHash;
      try {
        const data = jwt.verify(req.cookies.access_token, secret);
        if (
          data.role !== possibleUser.role ||
          (role !== "any" && data.role !== role) ||
          data.email !== possibleUser.email ||
          data.id !== possibleUser.id
        ) {
          return res
            .status(401)
            .send("You are not authorized to view this content!");
        }
        req.user = possibleUser;
        // req.role = data.role;
        return next();
      } catch (err) {
        return res.status(401).send("You are not authorized!");
        // console.log(err.JsonWebTokenError);
      }
    } else {
      return res.status(403).send("You are not logged in!");
    }
  };
}

module.exports = { authenticate };
