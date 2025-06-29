const { Dealer, Address } = require('../models');

// Yeni bayi oluştur
const createDealer = async (req, res) => {
    try {
        const { addresses, ...dealerData } = req.body;

        const newDealer = await Dealer.create(dealerData);

        if (addresses && addresses.length > 0) {
            const addressList = addresses.map(addr => ({
                ...addr,
                dealerId: newDealer.id
            }));
            await Address.bulkCreate(addressList);
        }

        res.status(201).json({ message: 'Bayi başarıyla oluşturuldu', dealer: newDealer });
    } catch (err) {
        console.error('Hata:', err);
        res.status(500).json({ message: 'Sunucu hatası', error: err });
    }
};

// Tüm bayileri getir
const getAllDealers = async (req, res) => {
    try {
        const dealers = await Dealer.findAll({
            include: [{ model: Address, as: 'addresses' }]
        });
        res.json(dealers);
    } catch (error) {
        console.error('getAllDealers hatası:', error);
        res.status(500).json({ error: error.message });
    }
};

const getDealerById = async (req, res) => {
    try {
        const { id } = req.params;

        const dealer = await Dealer.findOne({
            where: { id },
            include: [{ model: Address, as: 'addresses' }]
        });

        if (!dealer) {
            return res.status(404).json({ message: 'Bayi bulunamadı' });
        }

        res.json(dealer);
    } catch (error) {
        console.error('getDealerById hatası:', error);
        res.status(500).json({ error: error.message });
    }
};
//? Bayileri onaylama isteği admin için ona göre giriş yapıyor.
// PATCH /dealers/:id/approve
const approveDealer = async (req, res) => {
    try {
        const { id } = req.params;

        const dealer = await Dealer.findByPk(id);
        if (!dealer) {
            return res.status(404).json({ message: 'Bayi bulunamadı' });
        }

        dealer.isApproved = true;
        await dealer.save();

        res.status(200).json({ message: 'Bayi onaylandı', dealer });
    } catch (err) {
        console.error('Hata:', err);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

module.exports = {
    createDealer,
    getAllDealers,
    getDealerById,
    approveDealer
};
