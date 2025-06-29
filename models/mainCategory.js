"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MainCategory extends Model {
    static associate(models) {
      MainCategory.hasMany(models.Category, {
        foreignKey: "mainCategoryId",
        as: "categories"
      });
    }
  }
  MainCategory.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      name: DataTypes.STRING,
      description: DataTypes.TEXT
    },
    {
      sequelize,
      modelName: "MainCategory",
      tableName: "mainCategories"
    }
  );
  return MainCategory;
};
