const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    name: DataTypes.STRING,
    surname: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING,
    phone: DataTypes.STRING,
    type: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    hooks: {
      beforeCreate: async (customer) => {
        if (customer.password) {
          const salt = await bcrypt.genSalt(10);
          customer.password = await bcrypt.hash(customer.password, salt);
        }
      },
      beforeUpdate: async (customer) => {
        if (customer.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          customer.password = await bcrypt.hash(customer.password, salt);
        }
      }
    }
  });

  Customer.associate = function (models) {
    Customer.hasMany(models.Address, { foreignKey: 'customerId', as: 'addresses' });
  };

  // Opsiyonel: Login sırasında kullanmak için
  Customer.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  return Customer;
};
