const { Customer, Address } = require('../models');

// Yeni müşteri oluştur (adresleriyle birlikte)
const createCustomer = async (req, res) => {
    try {
        const { addresses, ...customerData } = req.body;

        const newCustomer = await Customer.create(customerData);

        if (addresses && addresses.length > 0) {
            const addressList = addresses.map(addr => ({
                ...addr,
                customerId: newCustomer.id
            }));
            await Address.bulkCreate(addressList);
        }

        res.status(201).json({ message: 'Müşteri başarıyla oluşturuldu', customer: newCustomer });
    } catch (err) {
        console.error('Hata:', err);
        res.status(500).json({ message: 'Sunucu hatası', error: err });
    }
};

// Tüm müşterileri getir
const getAllCustomers = async (req, res, next) => {
    try {
        const customers = await Customer.findAll({
            include: [{ model: Address, as: 'addresses' }]
        });
        res.json(customers);
    } catch (error) {
        console.error("getAllCustomers hatası:", error);
        res.status(500).json({ error: error.message });
    }
};

const getCustomerById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const customer = await Customer.findOne({
            where: { id },
            include: [{ model: Address, as: 'addresses' }]
        });

        if (!customer) {
            return res.status(404).json({ message: 'Müşteri bulunamadı' });
        }

        res.json(customer);
    } catch (error) {
        console.error("getCustomerById hatası:", error);
        res.status(500).json({ error: error.message });
    }
};


// Belli kullanıcıya sonradan address ekleme
const addAddressToCustomer = async (req, res) => {
    try {
        const customerId = req.params.id;
        const addressData = req.body;

        const customer = await Customer.findByPk(customerId);

        if (!customer) {
            return res.status(404).json({ message: 'Müşteri bulunamadı' });
        }

        // Adrese müşteriId'yi ekle
        const newAddress = await Address.create({
            ...addressData,
            customerId: customerId
        });

        res.status(201).json({ message: 'Adres başarıyla eklendi', address: newAddress });
    } catch (error) {
        console.error("Adres ekleme hatası:", error);
        res.status(500).json({ message: 'Sunucu hatası', error });
    }
};

module.exports = {
    createCustomer,
    getAllCustomers,
    addAddressToCustomer,
    getCustomerById
};
