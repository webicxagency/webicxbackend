const { Invoice, InvoiceMilestone, Project, AuditLog } = require('../models');

class InvoiceService {
  static async createInvoice(projectId, userId, companyId) {
    const project = await Project.findOne({ where: { id: projectId, companyId } });
    if (!project) throw new Error('Project not found');

    const totalAmount = project.contractValue;
    const milestones = [
      { index: 1, percentage: 50 },
      { index: 2, percentage: 30 },
      { index: 3, percentage: 20 }
    ];

    const invoice = await Invoice.create({
      companyId,
      projectId,
      invoiceNumber: `INV-${Date.now()}`,
      currency: 'GHS',
      totalAmount,
      status: 'draft',
      issuedAt: new Date(),
      dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      createdBy: userId
    });

    for (const m of milestones) {
      const amount = (totalAmount * m.percentage) / 100;
      await InvoiceMilestone.create({
        invoiceId: invoice.id,
        milestoneIndex: m.index,
        percentage: m.percentage,
        amount,
        status: m.index === 1 ? 'pending' : 'locked'
      });
    }

    invoice.status = 'issued';
    await invoice.save();

    // Audit
    await AuditLog.create({
      companyId,
      userId,
      action: 'INVOICE_CREATED',
      entityType: 'Invoice',
      entityId: invoice.id,
      details: { projectId },
      ipAddress: '',
      userAgent: ''
    });

    return invoice;
  }

  // Other methods
}

module.exports = InvoiceService;