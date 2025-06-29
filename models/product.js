const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Product extends Model {
    static associate(models) {
      this.hasMany(models.Variant, { foreignKey: 'productId', as: 'variants' });
    }
  }

  Product.init(
    {
      Product_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      Product_code: DataTypes.STRING,
      Name: DataTypes.STRING,
      Barcode: DataTypes.STRING,
      Brand: DataTypes.STRING,
      CurrencyType: DataTypes.STRING,
      Description: DataTypes.TEXT,
      Image1: DataTypes.TEXT,
      Image2: DataTypes.TEXT,
      Image3: DataTypes.TEXT,
      Image4: DataTypes.TEXT,
      Image5: DataTypes.TEXT,
      Stock: DataTypes.INTEGER,
      Tax: DataTypes.FLOAT,
      category: DataTypes.STRING,
      category_id: DataTypes.STRING,
      mainCategory: DataTypes.STRING,
      mainCategory_id: DataTypes.STRING,
      subCategory: DataTypes.STRING,
      subCategory_id: DataTypes.STRING,
      trendyol_salePrice: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: 'Product',
      tableName: 'Products',
    }
  );

  return Product;
};
