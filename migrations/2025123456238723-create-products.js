'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      Product_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
      },
      Product_code: Sequelize.STRING,
      Name: Sequelize.STRING,
      Barcode: Sequelize.STRING,
      Brand: Sequelize.STRING,
      CurrencyType: Sequelize.STRING,
      Description: Sequelize.TEXT,
      Image1: Sequelize.TEXT,
      Image2: Sequelize.TEXT,
      Image3: Sequelize.TEXT,
      Image4: Sequelize.TEXT,
      Image5: Sequelize.TEXT,
      Stock: Sequelize.INTEGER,
      Tax: Sequelize.FLOAT,
      category: Sequelize.STRING,
      category_id: Sequelize.STRING,
      mainCategory: Sequelize.STRING,
      mainCategory_id: Sequelize.STRING,
      subCategory: Sequelize.STRING,
      subCategory_id: Sequelize.STRING,
      trendyol_salePrice: Sequelize.FLOAT,
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Products');
  },
};
