const express = require('express');
const PaystackService = require('../services/paystackService');
const PrimeGraphicsPaystackService = require('../services/primeGraphicsPaystackService');

const router = express.Router();

router.post('/paystack', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const payload = JSON.parse(req.body);

    // Check if it's a PrimeGraphics payment by reference prefix
    if (payload.data && payload.data.reference && payload.data.reference.startsWith('primegraphics-invoice-')) {
      await PrimeGraphicsPaystackService.handleWebhook(payload, signature);
    } else {
      await PaystackService.handleWebhook(payload, signature);
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error(err);
    res.status(400).send('Error');
  }
});

module.exports = router;