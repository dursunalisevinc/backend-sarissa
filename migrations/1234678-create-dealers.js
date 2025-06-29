'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) Dealers tablosunu oluştur
    await queryInterface.createTable('Dealers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      surname: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING,
        unique: true
      },
      password: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      isApproved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    // NOT: 'dealerId' sütunu zaten 'Addresses' tablosunda mevcut,
    // bu yüzden addColumn kısmı kaldırıldı.
  },

  async down(queryInterface, Sequelize) {
    // Sadece Dealers tablosunu sil
    await queryInterface.dropTable('Dealers');
  }
};
