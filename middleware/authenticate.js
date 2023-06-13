// const { getUserRole } = require("./getUserRole");
const jwt = require("jsonwebtoken");
const db = require("../models");
const { DataTypes } = require("sequelize");
const User = require("../models/user")(db.sequelize, DataTypes);
// const User = require("../database/models/user")(db.sequelize, DataTypes);

function authenticate(role) {
  return async (req, res, next) => {
    // console.log(req.body);
    const possibleUser = await User.findOne({
      where: { email: req.cookies.email },
    });

    if (possibleUser) {
      const secret = process.env.JWT_SECRET + possibleUser.passwordHash;
      try {
        console.log(req.cookies.access_token);
        const data = jwt.verify(req.cookies.access_token, secret);
        if (
          data.role !== possibleUser.role ||
          data.role !== role ||
          data.email !== req.body.email ||
          data.id !== possibleUser.id
        ) {
          return res.status(401).send("Role doesn't match so Forbidden");
        }
        req.user = possibleUser;
        // req.role = data.role;
        return next();
      } catch (err) {
        return res.status(401).send(err);
        // console.log(err.JsonWebTokenError);
      }
    } else {
      return res.status(403).send("Forbidden");
    }
  };
}

module.exports = { authenticate };
