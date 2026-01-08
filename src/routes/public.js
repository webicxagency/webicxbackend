const express = require('express');
const PublicLinkService = require('../services/publicLinkService');
const { Document, DocumentSignature, InvoiceMilestone, PrimeGraphicsPayment, PrimeGraphicsInvoice, Client } = require('../models');
const PaystackService = require('../services/paystackService');

const router = express.Router();

router.get('/sign/:token', async (req, res) => {
  try {
    const payload = PublicLinkService.verifyToken(req.params.token);
    if (payload.type !== 'sign') throw new Error('Invalid token type');

    const document = await Document.findByPk(payload.documentId);
    if (!document) throw new Error('Document not found');

    // Render page with PDF and sign button
    res.send(`
      <html>
        <body>
          <iframe src="${document.fileUrl}" width="100%" height="600px"></iframe>
          <form action="/public/sign/${req.params.token}" method="POST">
            <button type="submit">Sign Document</button>
          </form>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(400).send('Invalid link');
  }
});

router.post('/sign/:token', async (req, res) => {
  try {
    const payload = PublicLinkService.verifyToken(req.params.token);
    const document = await Document.findByPk(payload.documentId);

    // Record signature
    await DocumentSignature.create({
      documentId: payload.documentId,
      signedByType: 'client',
      signedById: null,
      signedAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    document.status = 'signed';
    await document.save();

    res.send('Document signed successfully');
  } catch (err) {
    res.status(400).send('Error');
  }
});

router.get('/pay/:milestoneId/:token', async (req, res) => {
  try {
    const payload = PublicLinkService.verifyToken(req.params.token);
    if (payload.type !== 'pay' || payload.milestoneId != req.params.milestoneId) throw new Error('Invalid token');

    const milestone = await InvoiceMilestone.findByPk(payload.milestoneId);
    if (!milestone) throw new Error('Milestone not found');

    const paymentUrl = await PaystackService.createPaymentLink(milestone.invoiceId, milestone.id, milestone.invoice.companyId);

    res.redirect(paymentUrl);
  } catch (err) {
    res.status(400).send('Invalid link');
  }
});

router.get('/invoice', async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) return res.status(400).json({ error: 'Reference parameter is required' });

    const payment = await PrimeGraphicsPayment.findOne({
      where: { reference },
      include: [{
        model: PrimeGraphicsInvoice,
        as: 'invoice',
        include: [{ model: Client, as: 'client' }]
      }]
    });

    if (!payment || !payment.invoice) return res.status(404).json({ error: 'Payment or invoice not found' });

    const invoice = payment.invoice;
    const client = invoice.client;

    res.json({
      invoiceNumber: invoice.invoice_number,
      clientName: client ? client.name : 'Unknown Client',
      downloadUrl: invoice.pdf_url,
      amount: payment.amount,
      date: payment.paid_at
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;