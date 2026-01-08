const axios = require('axios');
const { PrimeGraphicsInvoice, PrimeGraphicsPayment, Client } = require('../models');

class PrimeGraphicsPaystackService {
  static async createPaymentLink(invoiceId) {
    console.log('DEBUG: PrimeGraphicsPaystackService.createPaymentLink called for invoice:', invoiceId);

    const invoice = await PrimeGraphicsInvoice.findByPk(invoiceId, {
      include: [{ model: Client, as: 'client' }]
    });
    if (!invoice) {
      console.log('DEBUG: Invoice not found for payment link');
      throw new Error('Invoice not found');
    }

    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email: invoice.client.email,
      amount: invoice.total * 100, // in kobo
      currency: 'GHS',
      reference: `primegraphics-invoice-${invoiceId}-${Date.now()}`,
      callback_url: `${process.env.BASE_URL || 'https://primegraphicsapp.vercel.app'}`
    }, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Save payment reference
    await PrimeGraphicsPayment.create({
      invoice_id: invoiceId,
      amount: invoice.total,
      provider: 'paystack',
      reference: response.data.data.reference,
      status: 'pending'
    });

    console.log('DEBUG: Payment link created:', response.data.data.authorization_url);
    return response.data.data.authorization_url;
  }

  static async handleWebhook(payload, signature) {
    const hash = require('crypto').createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) throw new Error('Invalid signature');

    const event = payload.event;
    if (event === 'charge.success') {
      const reference = payload.data.reference;
      const amount = payload.data.amount / 100;

      // Find payment by reference
      const payment = await PrimeGraphicsPayment.findOne({ where: { reference } });
      if (!payment) return;

      // Check if already processed
      if (payment.status === 'success') return;

      // Validate amount
      if (payment.amount !== amount) throw new Error('Amount mismatch');

      // Update payment
      payment.status = 'success';
      payment.paid_at = new Date();
      await payment.save();

      // Update invoice status
      const invoice = await PrimeGraphicsInvoice.findByPk(payment.invoice_id);
      if (invoice) {
        invoice.status = 'PAID';
        await invoice.save();
      }
    }
  }
}

module.exports = PrimeGraphicsPaystackService;