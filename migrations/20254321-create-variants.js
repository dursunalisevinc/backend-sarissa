'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Variants', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      variantId: Sequelize.STRING,
      productCode: Sequelize.STRING,
      barcode: Sequelize.STRING,
      gtin: Sequelize.STRING,
      mpn: Sequelize.STRING,
      rafno: Sequelize.STRING,
      depth: Sequelize.FLOAT,
      height: Sequelize.FLOAT,
      width: Sequelize.FLOAT,
      agirlik: Sequelize.FLOAT,
      desi: Sequelize.FLOAT,
      quantity: Sequelize.INTEGER,
      price: Sequelize.FLOAT,
      hbSaticiStokKodu: Sequelize.STRING,
      hbKodu: Sequelize.STRING,
      spec_name: Sequelize.STRING,
      spec_value: Sequelize.STRING,
      productId: {
        type: Sequelize.STRING,
        references: {
          model: 'Products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Variants');
  }
};