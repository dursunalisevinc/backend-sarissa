const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Variant extends Model {
    static associate(models) {
      this.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    }
  }

  Variant.init({
    variantId: DataTypes.STRING,
    productCode: DataTypes.STRING,
    barcode: DataTypes.STRING,
    gtin: DataTypes.STRING,
    mpn: DataTypes.STRING,
    rafno: DataTypes.STRING,
    depth: DataTypes.FLOAT,
    height: DataTypes.FLOAT,
    width: DataTypes.FLOAT,
    agirlik: DataTypes.FLOAT,
    desi: DataTypes.FLOAT,
    quantity: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
    hbSaticiStokKodu: DataTypes.STRING,
    hbKodu: DataTypes.STRING,
    spec_name: DataTypes.STRING,
    spec_value: DataTypes.STRING,
    productId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Variant',
    tableName: 'Variants'
  });

  return Variant;
};
