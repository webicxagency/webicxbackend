const { Project, AuditLog } = require('../models');

const stages = {
  MSA_SENT: 'MSA_SENT',
  MSA_SIGNED: 'MSA_SIGNED',
  LEAD_ACTIVE: 'LEAD_ACTIVE',
  SOW_V1_SENT: 'SOW_V1_SENT',
  SOW_REVISION_REQUESTED: 'SOW_REVISION_REQUESTED',
  SOW_RESENT: 'SOW_RESENT',
  SOW_FINAL_APPROVED: 'SOW_FINAL_APPROVED',
  INVOICE_50_SENT: 'INVOICE_50_SENT',
  INVOICE_50_PAID: 'INVOICE_50_PAID',
  PROJECT_STARTED: 'PROJECT_STARTED',
  INVOICE_30_SENT: 'INVOICE_30_SENT',
  INVOICE_30_PAID: 'INVOICE_30_PAID',
  FINAL_DELIVERY: 'FINAL_DELIVERY',
  INVOICE_20_SENT: 'INVOICE_20_SENT',
  INVOICE_20_PAID: 'INVOICE_20_PAID',
  PROJECT_COMPLETED: 'PROJECT_COMPLETED'
};

const transitions = {
  [stages.MSA_SENT]: [stages.MSA_SIGNED],
  [stages.MSA_SIGNED]: [stages.LEAD_ACTIVE],
  [stages.LEAD_ACTIVE]: [stages.SOW_V1_SENT],
  [stages.SOW_V1_SENT]: [stages.SOW_REVISION_REQUESTED, stages.SOW_FINAL_APPROVED],
  [stages.SOW_REVISION_REQUESTED]: [stages.SOW_RESENT],
  [stages.SOW_RESENT]: [stages.SOW_REVISION_REQUESTED, stages.SOW_FINAL_APPROVED],
  [stages.SOW_FINAL_APPROVED]: [stages.INVOICE_50_SENT],
  [stages.INVOICE_50_SENT]: [stages.INVOICE_50_PAID],
  [stages.INVOICE_50_PAID]: [stages.PROJECT_STARTED],
  [stages.PROJECT_STARTED]: [stages.INVOICE_30_SENT],
  [stages.INVOICE_30_SENT]: [stages.INVOICE_30_PAID],
  [stages.INVOICE_30_PAID]: [stages.FINAL_DELIVERY],
  [stages.FINAL_DELIVERY]: [stages.INVOICE_20_SENT],
  [stages.INVOICE_20_SENT]: [stages.INVOICE_20_PAID],
  [stages.INVOICE_20_PAID]: [stages.PROJECT_COMPLETED]
};

class WorkflowService {
  static canTransition(fromStage, toStage) {
    return transitions[fromStage] && transitions[fromStage].includes(toStage);
  }

  static async advanceStage(projectId, newStage, userId, companyId, ipAddress = '', userAgent = '') {
    const project = await Project.findOne({ where: { id: projectId, companyId } });
    if (!project) throw new Error('Project not found');

    if (!this.canTransition(project.stage, newStage)) {
      throw new Error(`Invalid transition from ${project.stage} to ${newStage}`);
    }

    const oldStage = project.stage;
    project.stage = newStage;
    await project.save();

    // Log audit
    await AuditLog.create({
      companyId,
      userId,
      action: 'STAGE_ADVANCED',
      entityType: 'Project',
      entityId: projectId,
      details: { oldStage, newStage },
      ipAddress,
      userAgent
    });

    return project;
  }
}

module.exports = WorkflowService;