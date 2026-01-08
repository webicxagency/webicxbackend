const express = require('express');
const { Op } = require('sequelize');
const { authenticate, authorize } = require('../middleware/auth');
const clientsController = require('../controllers/clientsController');
const servicesController = require('../controllers/servicesController');
const invoicesController = require('../controllers/invoicesController');
const paymentsController = require('../controllers/paymentsController');

const router = express.Router();

// Apply authentication and authorization to all routes
router.use(authenticate);
router.use(authorize(['PRIMEGRAPHICS_ADMIN']));

// Clients routes
router.get('/clients', clientsController.getClients);
router.get('/clients/:id', clientsController.getClient);
router.post('/clients', clientsController.createClient);
router.put('/clients/:id', clientsController.updateClient);
router.delete('/clients/:id', clientsController.deleteClient);

// Services routes
router.get('/services', servicesController.getServices);
router.get('/services/:id', servicesController.getService);
router.post('/services', servicesController.createService);
router.put('/services/:id', servicesController.updateService);
router.delete('/services/:id', servicesController.deleteService);

// Invoices routes
router.get('/invoices', invoicesController.getInvoices);
router.get('/invoices/:id', invoicesController.getInvoice);
router.post('/invoices', invoicesController.createInvoice);
router.put('/invoices/:id', invoicesController.updateInvoice);
router.delete('/invoices/:id', invoicesController.deleteInvoice);
router.post('/invoices/:id/send', invoicesController.sendInvoice);

// Payments routes
router.get('/payments', paymentsController.getPayments);
router.get('/payments/:id', paymentsController.getPayment);
router.get('/payments/status/:reference', paymentsController.checkPaymentStatus);
router.get('/invoices/:invoiceId/payments', paymentsController.getPaymentsForInvoice);

// Dashboard metrics
router.get('/dashboard', async (req, res) => {
  try {
    const { PrimeGraphicsInvoice, PrimeGraphicsPayment } = require('../models');

    const totalInvoices = await PrimeGraphicsInvoice.count();
    let totalRevenue = 0;
    try {
      const totalRevenueResult = await PrimeGraphicsPayment.sum('amount', { where: { status: 'success' } });
      totalRevenue = totalRevenueResult || 0;
    } catch (sumError) {
      // Handle empty payments table
    }

    const unpaidInvoices = await PrimeGraphicsInvoice.count({ where: { status: { [Op.ne]: 'PAID' } } });
    const overdueInvoices = await PrimeGraphicsInvoice.count({
      where: {
        status: { [Op.ne]: 'PAID' },
        due_date: { [Op.lt]: new Date() }
      }
    });

    res.json({
      totalInvoices,
      totalRevenue,
      unpaidInvoices,
      overdueInvoices
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;