const { Client } = require('../models');

const getClients = async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getClient = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createClient = async (req, res) => {
  try {
    console.log('DEBUG: createClient req.body:', JSON.stringify(req.body, null, 2));
    const client = await Client.create(req.body);
    res.status(201).json(client);
  } catch (error) {
    console.error('DEBUG: createClient error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateClient = async (req, res) => {
  try {
    console.log('DEBUG: updateClient req.body:', JSON.stringify(req.body, null, 2));
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    await client.update(req.body);
    res.json(client);
  } catch (error) {
    console.error('DEBUG: updateClient error:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    await client.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
};