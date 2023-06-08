// const { getUserRole } = require("./getUserRole");
const jwt = require("jsonwebtoken");
const db = require("../models");
const { DataTypes } = require("sequelize");
const User = require("../models/user")(db.sequelize, DataTypes);
// const User = require("../database/models/user")(db.sequelize, DataTypes);

function authenticate(role) {
  return async (req, res, next) => {
    const possibleUser = await User.findOne({
      where: { email: req.body.email },
    });

    if (possibleUser) {
      const secret = process.env.JWT_SECRET + possibleUser.passwordHash;
      try {
        // const data = jwt.verify(req.cookies.access_token, secret);
        // if (data.role !== role) {
        //   return res.status(401).send("Forbidden");
        // }
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
