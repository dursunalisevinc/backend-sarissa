// orderController.js

const { Order, OrderItem } = require('../models');

exports.createOrder = async (req, res) => {
  try {
    const { customerId, dealerId, status, shippingInfo, totalAmount, orderItems } = req.body;

    if (!totalAmount || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'totalAmount ve orderItems (en az 1 ürün) zorunludur.' });
    }

    // Yeni sipariş oluştur
    const newOrder = await Order.create({
      customerId: customerId || null,
      dealerId: dealerId || null,
      status: status || 'pending',
      shippingInfo: shippingInfo || null,
      totalAmount
    });

    // Sipariş ürünlerini oluştur
    const orderItemsToCreate = orderItems.map(item => ({
      orderId: newOrder.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice
    }));

    await OrderItem.bulkCreate(orderItemsToCreate);

    // Yeni siparişi detaylarıyla beraber getir
    const createdOrder = await Order.findOne({
      where: { id: newOrder.id },
      include: [{ model: OrderItem, as: 'orderItems' }]
    });

    res.status(201).json({ message: 'Sipariş oluşturuldu', order: createdOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sipariş oluşturulurken hata oluştu', error: error.message });
  }
};


//! sipariş durumu ve kargo düzenleniyor.
exports.updateOrderStatusAndShipping = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, shippingInfo } = req.body;

    // Siparişi bul
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Sipariş bulunamadı.' });
    }

    // Status kontrolü (opsiyonel, enum dışı gönderilirse hata)
    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'canceled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Geçersiz sipariş durumu.' });
    }

    // Gelen alanlara göre güncelle
    if (status) order.status = status;
    if (shippingInfo) order.shippingInfo = shippingInfo;

    await order.save();

    res.status(200).json({ message: 'Sipariş durumu ve kargo bilgisi güncellendi', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sipariş güncellenirken hata oluştu', error: error.message });
  }
};
