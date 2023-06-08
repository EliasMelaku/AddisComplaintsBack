"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Feedback extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Feedback.belongsTo(models.User, {
        foreignKey: "email",
        as: "user",
        onDelete: "CASCADE",
      });
    }
  }
  Feedback.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      comment: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      pdf: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: "Feedback",
    }
  );
  return Feedback;
};
