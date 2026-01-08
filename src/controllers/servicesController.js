const { Service } = require('../models');

const getServices = async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createService = async (req, res) => {
  try {
    console.log('DEBUG: createService req.body:', JSON.stringify(req.body, null, 2));
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (error) {
    console.error('DEBUG: createService error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateService = async (req, res) => {
  try {
    console.log('DEBUG: updateService req.body:', JSON.stringify(req.body, null, 2));
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    await service.update(req.body);
    res.json(service);
  } catch (error) {
    console.error('DEBUG: updateService error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    await service.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService
};