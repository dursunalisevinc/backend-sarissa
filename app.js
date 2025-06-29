const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: true,
    // origin: 'http://192.168.48.43:5173',
    credentials: true,
}));

app.get('/', (req, res) => {
    res.send('Sunucu çalışıyor! 🚀');
});

app.use(express.json());

const dealerRoutes = require('./routes/dealer');
const customerRoutes = require('./routes/customer');
const addressRoutes = require('./routes/address');
const authRoutes = require('./routes/auth');
const mainCategoryRoutes = require('./routes/mainCategoryRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const productRoutes = require('./routes/productRoutes');
const xmlProxyRoutes = require('./routes/xmlProxy');
const productCombinedRoutes = require('./routes/productCombinedRoutes');
const orderRoutes = require('./routes/orderRouter');

app.use('/customers', customerRoutes);
app.use('/addresses', addressRoutes);
app.use('/dealers', dealerRoutes);
app.use('/auth', authRoutes);
app.use('/mainCategories', mainCategoryRoutes);
app.use('/categories', categoryRoutes);
app.use('/subCategories', subCategoryRoutes);
app.use('/products', productRoutes);
app.use('/xml', xmlProxyRoutes);
app.use('/allProduct', productCombinedRoutes);
app.use('/orders', orderRoutes);

module.exports = app;
