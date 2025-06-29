const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Customer, Dealer } = require('../models');
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, type: user.type },  // payload
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Ortak login
exports.login = async (req, res) => {
  const { email, password, userType } = req.body;  // userType: "customer" veya "dealer"

  try {
    let user;
    if (userType === 'customer') {
      user = await Customer.findOne({ where: { email } });
    } else if (userType === 'dealer') {
      user = await Dealer.findOne({ where: { email } });

      // Bayi onay durumu kontrolü
      if (user && !user.isApproved) {
        return res.status(403).json({ message: 'Bayi başvurunuz henüz onaylanmamış.' });
      }
    } else {
      return res.status(400).json({ message: 'Geçersiz kullanıcı türü.' });
    }

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Şifre yanlış.' });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Giriş başarılı!',
      token,
      user: {
        id: user.id,
        email: user.email,
        type: userType
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Sunucu hatası.' });
  }
};

