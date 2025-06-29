'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // Customer ilişkisi (optional)
      Order.belongsTo(models.Customer, {
        foreignKey: 'customerId',
        as: 'customer',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
      // Dealer ilişkisi (optional)
      Order.belongsTo(models.Dealer, {
        foreignKey: 'dealerId',
        as: 'dealer',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
      // OrderItems ile 1:N ilişki
      Order.hasMany(models.OrderItem, {
        foreignKey: 'orderId',
        as: 'orderItems',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Order.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customerId: DataTypes.INTEGER,
    dealerId: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'canceled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    shippingInfo: DataTypes.JSONB,
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'Orders',
    timestamps: true,
  });

  return Order;
};
