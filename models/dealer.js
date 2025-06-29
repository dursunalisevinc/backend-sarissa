const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const Dealer = sequelize.define('Dealer', {
    name: DataTypes.STRING,
    surname: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING,
    phone: DataTypes.STRING,
    type: DataTypes.STRING,
    isApproved: {           // ✅ Yeni eklediğin alan
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    hooks: {
      beforeCreate: async (dealer) => {
        if (dealer.password) {
          const salt = await bcrypt.genSalt(10);
          dealer.password = await bcrypt.hash(dealer.password, salt);
        }
      },
      beforeUpdate: async (dealer) => {
        if (dealer.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          dealer.password = await bcrypt.hash(dealer.password, salt);
        }
      }
    }
  });

  Dealer.associate = function(models) {
    Dealer.hasMany(models.Address, {
      foreignKey: 'dealerId',
      as: 'addresses'
    });
  };

  // Opsiyonel: Şifre kontrolü
  Dealer.prototype.validPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  return Dealer;
};
