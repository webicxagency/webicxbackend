const { PrimeGraphicsPayment, PrimeGraphicsInvoice } = require('../models');

const getPayments = async (req, res) => {
  try {
    const payments = await PrimeGraphicsPayment.findAll({
      include: [{ model: PrimeGraphicsInvoice, as: 'invoice' }]
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPayment = async (req, res) => {
  try {
    const payment = await PrimeGraphicsPayment.findByPk(req.params.id, {
      include: [{ model: PrimeGraphicsInvoice, as: 'invoice' }]
    });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkPaymentStatus = async (req, res) => {
  try {
    const payment = await PrimeGraphicsPayment.findOne({
      where: { reference: req.params.reference },
      include: [{ model: PrimeGraphicsInvoice, as: 'invoice' }]
    });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json({ status: payment.status, invoice: payment.invoice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPaymentsForInvoice = async (req, res) => {
  try {
    const payments = await PrimeGraphicsPayment.findAll({
      where: { invoice_id: req.params.invoiceId },
      include: [{ model: PrimeGraphicsInvoice, as: 'invoice' }]
    });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPayments,
  getPayment,
  checkPaymentStatus,
  getPaymentsForInvoice
};