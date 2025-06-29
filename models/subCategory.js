"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SubCategory extends Model {
    static associate(models) {
      SubCategory.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "category"
      });
    }
  }
  SubCategory.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      name: DataTypes.STRING,
      categoryId: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "SubCategory",
      tableName: "subCategories"
    }
  );
  return SubCategory;
};
