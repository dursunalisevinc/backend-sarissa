const app = require('./app');
const { sequelize } = require('./models');

const HOST = '0.0.0.0';
const PORT = process.env.PORT || 8000;

sequelize.authenticate()
    .then(() => {
        console.log('Veritabanına bağlandı.');
        app.listen(PORT, HOST, () => {
            console.log(`Sunucu http://${HOST}:${PORT} adresinde çalışıyor.`);
        });
    })
    .catch(err => {
        console.error('Veritabanı bağlantı hatası:', err);
    });
