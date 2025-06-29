"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.belongsTo(models.MainCategory, {
        foreignKey: "mainCategoryId",
        as: "mainCategory"
      });
      Category.hasMany(models.SubCategory, {
        foreignKey: "categoryId",
        as: "subCategories"
      });
    }
  }
  Category.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      name: DataTypes.STRING,
      mainCategoryId: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "categories"
    }
  );
  return Category;
};
