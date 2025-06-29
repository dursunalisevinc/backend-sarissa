'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Customers', 'role', {
      type: Sequelize.STRING,
      allowNull: true, // veya false, zorunlu olmasını istiyorsan
      defaultValue: 'user' // varsayılan değer istersen
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Customers', 'role');
  }
};
