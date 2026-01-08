const { PrimeGraphicsInvoice, Client, PrimeGraphicsPayment, Service } = require('../models');
const PDFService = require('../services/pdfService');
const EmailService = require('../services/emailService');
const PrimeGraphicsPaystackService = require('../services/primeGraphicsPaystackService');

const getInvoices = async (req, res) => {
  try {
    const invoices = await PrimeGraphicsInvoice.findAll({
      include: [{ model: Client, as: 'client', required: false }]
    });
    const invoicesData = [];
    for (const invoice of invoices) {
      const data = invoice.toJSON();
      let services = invoice.services ? JSON.parse(invoice.services) : [];
      // Ensure services have service names
      if (services.length > 0 && services[0].service_id) {
        // Old format, fetch service names
        const serviceIds = services.map(s => s.service_id);
        const serviceRecords = await Service.findAll({
          where: { id: serviceIds },
          attributes: ['id', 'name']
        });
        const serviceMap = {};
        serviceRecords.forEach(s => serviceMap[s.id] = s.name);
        services = services.map(s => ({
          service: serviceMap[s.service_id] || 'Unknown Service',
          quantity: s.quantity,
          price: s.price
        }));
      }
      data.services = services;
      invoicesData.push(data);
    }
    res.json(invoicesData);
  } catch (error) {
    console.error('Invoices query error:', error);
    // Fallback to basic query without include
    try {
      const invoices = await PrimeGraphicsInvoice.findAll();
      const invoicesData = [];
      for (const invoice of invoices) {
        const data = invoice.toJSON();
        let services = invoice.services ? JSON.parse(invoice.services) : [];
        if (services.length > 0 && services[0].service_id) {
          const serviceIds = services.map(s => s.service_id);
          const serviceRecords = await Service.findAll({
            where: { id: serviceIds },
            attributes: ['id', 'name']
          });
          const serviceMap = {};
          serviceRecords.forEach(s => serviceMap[s.id] = s.name);
          services = services.map(s => ({
            service: serviceMap[s.service_id] || 'Unknown Service',
            quantity: s.quantity,
            price: s.price
          }));
        }
        data.services = services;
        invoicesData.push(data);
      }
      res.json(invoicesData);
    } catch (fallbackError) {
      res.status(500).json({ error: fallbackError.message });
    }
  }
};

const getInvoice = async (req, res) => {
  try {
    const invoice = await PrimeGraphicsInvoice.findByPk(req.params.id, {
      include: [{ model: Client, as: 'client' }]
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    const invoiceData = invoice.toJSON();
    let services = invoice.services ? JSON.parse(invoice.services) : [];
    // Ensure services have service names
    if (services.length > 0 && services[0].service_id) {
      // Old format, fetch service names
      const serviceIds = services.map(s => s.service_id);
      const serviceRecords = await Service.findAll({
        where: { id: serviceIds },
        attributes: ['id', 'name']
      });
      const serviceMap = {};
      serviceRecords.forEach(s => serviceMap[s.id] = s.name);
      services = services.map(s => ({
        service: serviceMap[s.service_id] || 'Unknown Service',
        quantity: s.quantity,
        price: s.price
      }));
    }
    invoiceData.services = services;
    res.json(invoiceData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createInvoice = async (req, res) => {
  try {
    console.log('DEBUG: createInvoice req.body:', JSON.stringify(req.body, null, 2));

    // Calculate subtotal and total from services
    let subtotal = 0;
    if (req.body.services && Array.isArray(req.body.services)) {
      subtotal = req.body.services.reduce((sum, service) => {
        return sum + (service.quantity * service.price);
      }, 0);
    }

    const discount = parseFloat(req.body.discount) || 0;
    const tax = parseFloat(req.body.tax) || 0;
    const total = subtotal - discount + tax;

    // Generate invoice number
    const lastInvoice = await PrimeGraphicsInvoice.findOne({
      order: [['created_at', 'DESC']]
    });
    const invoiceNumber = lastInvoice
      ? `INV-${String(parseInt(lastInvoice.invoice_number.split('-')[1]) + 1).padStart(4, '0')}`
      : 'INV-0001';

    const invoiceData = {
      ...req.body,
      invoice_number: invoiceNumber,
      services: JSON.stringify(req.body.services || []),
      subtotal: subtotal,
      total: total,
      status: 'DRAFT',
      created_at: new Date()
    };

    console.log('DEBUG: createInvoice invoiceData:', JSON.stringify(invoiceData, null, 2));

    const invoice = await PrimeGraphicsInvoice.create(invoiceData);
    const createdInvoice = await PrimeGraphicsInvoice.findByPk(invoice.id, {
      include: [{ model: Client, as: 'client' }]
    });
    const invoiceDataResponse = createdInvoice.toJSON();
    invoiceDataResponse.services = createdInvoice.services ? JSON.parse(createdInvoice.services) : [];
    res.status(201).json(invoiceDataResponse);
  } catch (error) {
    console.error('DEBUG: createInvoice error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateInvoice = async (req, res) => {
  try {
    console.log('DEBUG: updateInvoice req.body:', JSON.stringify(req.body, null, 2));
    const invoice = await PrimeGraphicsInvoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // Only allow editing if status is DRAFT
    if (invoice.status !== 'DRAFT') {
      return res.status(403).json({ error: 'Only draft invoices can be edited' });
    }

    const updateData = { ...req.body };
    if (req.body.services) {
      updateData.services = JSON.stringify(req.body.services);
    }
    await invoice.update(updateData);
    const updatedInvoice = await PrimeGraphicsInvoice.findByPk(req.params.id, {
      include: [{ model: Client, as: 'client' }]
    });
    const invoiceDataResponse = updatedInvoice.toJSON();
    invoiceDataResponse.services = updatedInvoice.services ? JSON.parse(updatedInvoice.services) : [];
    res.json(invoiceDataResponse);
  } catch (error) {
    console.error('DEBUG: updateInvoice error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    console.log(`DEBUG: deleteInvoice called for id: ${req.params.id}`);
    const invoice = await PrimeGraphicsInvoice.findByPk(req.params.id, {
      include: [{ model: PrimeGraphicsPayment, as: 'payments' }]
    });
    if (!invoice) {
      console.log('DEBUG: Invoice not found');
      return res.status(404).json({ error: 'Invoice not found' });
    }

    console.log(`DEBUG: Invoice status: ${invoice.status}`);
    console.log(`DEBUG: Invoice has ${invoice.payments ? invoice.payments.length : 0} payments`);

    // Only allow deleting if status is DRAFT
    if (invoice.status !== 'DRAFT') {
      console.log('DEBUG: Cannot delete non-draft invoice');
      return res.status(403).json({ error: 'Only draft invoices can be deleted' });
    }

    console.log('DEBUG: Attempting to destroy associated payments first');
    await PrimeGraphicsPayment.destroy({ where: { invoice_id: req.params.id } });
    console.log('DEBUG: Payments destroyed, now destroying invoice');
    await invoice.destroy();
    console.log('DEBUG: Invoice destroyed successfully');
    res.status(204).send();
  } catch (error) {
    console.error('DEBUG: deleteInvoice error:', error);
    res.status(500).json({ error: error.message });
  }
};

const sendInvoice = async (req, res) => {
  try {
    const invoice = await PrimeGraphicsInvoice.findByPk(req.params.id, {
      include: [{ model: Client, as: 'client' }]
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    // Generate PDF if not exists
    let pdfResult;
    if (!invoice.pdf_url) {
      pdfResult = await PDFService.generateInvoicePDF(invoice, invoice.client);
      invoice.pdf_url = pdfResult.url;
      await invoice.save();
    } else {
      // If PDF exists, regenerate to get buffer (or cache buffer, but for simplicity regenerate)
      pdfResult = await PDFService.generateInvoicePDF(invoice, invoice.client);
    }

    // Create Paystack payment link
    const paymentUrl = await PrimeGraphicsPaystackService.createPaymentLink(invoice.id);

    // Send email
    await EmailService.sendInvoiceEmail(invoice.client, invoice, paymentUrl, pdfResult.buffer);

    // Update status to SENT
    invoice.status = 'SENT';
    await invoice.save();

    res.json({ message: 'Invoice sent successfully', paymentUrl });
  } catch (error) {
    console.error('DEBUG: sendInvoice error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  sendInvoice
};