const sequelize = require('../config/database');
const Sequelize = require('sequelize');

const Company = require('./company')(sequelize, Sequelize.DataTypes);
const User = require('./user')(sequelize, Sequelize.DataTypes);
const Lead = require('./lead')(sequelize, Sequelize.DataTypes);
const Project = require('./project')(sequelize, Sequelize.DataTypes);
const DocumentTemplate = require('./documenttemplate')(sequelize, Sequelize.DataTypes);
const Document = require('./document')(sequelize, Sequelize.DataTypes);
const DocumentVariable = require('./documentvariable')(sequelize, Sequelize.DataTypes);
const DocumentSignature = require('./documentsignature')(sequelize, Sequelize.DataTypes);
const Invoice = require('./invoice')(sequelize, Sequelize.DataTypes);
const InvoiceMilestone = require('./invoicemilestone')(sequelize, Sequelize.DataTypes);
const Payment = require('./payment')(sequelize, Sequelize.DataTypes);
const AuditLog = require('./auditlog')(sequelize, Sequelize.DataTypes);

// PrimeGraphics models
const Client = require('./client')(sequelize, Sequelize.DataTypes);
const Service = require('./service')(sequelize, Sequelize.DataTypes);
const PrimeGraphicsInvoice = require('./primegraphicsinvoice')(sequelize, Sequelize.DataTypes);
const PrimeGraphicsPayment = require('./primegraphicspayment')(sequelize, Sequelize.DataTypes);

const db = {
  Company,
  User,
  Lead,
  Project,
  DocumentTemplate,
  Document,
  DocumentVariable,
  DocumentSignature,
  Invoice,
  InvoiceMilestone,
  Payment,
  AuditLog,
  // PrimeGraphics
  Client,
  Service,
  PrimeGraphicsInvoice,
  PrimeGraphicsPayment
};

// Define associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = {
  ...db,
  sequelize,
  Sequelize
};