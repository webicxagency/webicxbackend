const axios = require('axios');
const crypto = require('crypto');
const { InvoiceMilestone, Payment, AuditLog, sequelize } = require('../models');

class PaystackService {
  static async createPaymentLink(invoiceId, milestoneId, companyId) {
    const milestone = await InvoiceMilestone.findOne({
      where: { id: milestoneId, invoiceId, status: 'pending' }
    });
    if (!milestone) throw new Error('Milestone not available for payment');

    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email: 'client@example.com', // From lead
      amount: milestone.amount * 100, // in kobo
      currency: 'GHS',
      reference: `milestone-${milestoneId}-${Date.now()}`,
      callback_url: `${process.env.BASE_URL}/payment/callback`
    }, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    milestone.paystackReference = response.data.data.reference;
    await milestone.save();

    return response.data.data.authorization_url;
  }

  static async handleWebhook(payload, signature) {
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(payload)).digest('hex');
    if (hash !== signature) throw new Error('Invalid signature');

    const event = payload.event;
    if (event === 'charge.success') {
      const reference = payload.data.reference;
      const amount = payload.data.amount / 100;

      // Find milestone by reference
      const milestone = await InvoiceMilestone.findOne({ where: { paystackReference: reference } });
      if (!milestone) return;

      // Check if already processed
      const existingPayment = await Payment.findOne({ where: { paystackReference: reference } });
      if (existingPayment) return;

      // Validate amount
      if (milestone.amount !== amount) throw new Error('Amount mismatch');

      // Update milestone
      milestone.status = 'paid';
      milestone.paidAt = new Date();
      await milestone.save();

      // Create payment record
      await Payment.create({
        invoiceId: milestone.invoiceId,
        milestoneId: milestone.id,
        paystackReference: reference,
        amount,
        currency: payload.data.currency,
        status: 'success',
        rawPayload: payload,
        verifiedAt: new Date()
      });

      // Unlock next milestone
      const nextIndex = milestone.milestoneIndex + 1;
      const nextMilestone = await InvoiceMilestone.findOne({
        where: { invoiceId: milestone.invoiceId, milestoneIndex: nextIndex }
      });
      if (nextMilestone) {
        nextMilestone.status = 'pending';
        await nextMilestone.save();
      }

      // Audit
      await AuditLog.create({
        companyId: milestone.invoice.companyId, // Need to get
        userId: null,
        action: 'PAYMENT_VERIFIED',
        entityType: 'Payment',
        entityId: null,
        details: { reference, amount },
        ipAddress: '',
        userAgent: ''
      });

      // TODO: Advance workflow
    }
  }
}

module.exports = PaystackService;