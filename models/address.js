module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    title: DataTypes.STRING,
    city: DataTypes.STRING,
    district: DataTypes.STRING,
    fullAddress: DataTypes.STRING,
    zipCode: DataTypes.STRING,
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    dealerId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  });

  Address.associate = function (models) {
    Address.belongsTo(models.Customer, { foreignKey: 'customerId', as: 'customer' });
    Address.belongsTo(models.Dealer, { foreignKey: 'dealerId', as: 'dealer' });
  };

  return Address;
};
