const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');
const { DocumentTemplate, Document, DocumentVariable, AuditLog } = require('../models');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class DocumentService {
  static validateVariables(templateVariables, providedVariables) {
    const required = Object.keys(templateVariables).filter(key => templateVariables[key].required);
    for (const key of required) {
      if (!providedVariables[key]) throw new Error(`Missing required variable: ${key}`);
    }
    return true;
  }

  static renderHtml(templateHtml, variables) {
    let html = templateHtml;
    for (const [key, value] of Object.entries(variables)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return html;
  }

  static async generatePdf(html) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    return pdfBuffer;
  }

  static async uploadToCloudinary(buffer, publicId) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'raw', public_id: publicId, format: 'pdf' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });
  }

  static async createDocument(templateId, variables, userId, companyId, projectId = null, leadId = null) {
    const template = await DocumentTemplate.findOne({ where: { id: templateId, companyId, isActive: true } });
    if (!template) throw new Error('Template not found');

    this.validateVariables(template.variables, variables);

    const html = this.renderHtml(template.bodyHtml, variables);
    const pdfBuffer = await this.generatePdf(html);

    const checksum = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

    // Get version
    const lastDoc = await Document.findOne({
      where: { templateId, projectId, leadId },
      order: [['version', 'DESC']]
    });
    const version = lastDoc ? lastDoc.version + 1 : 1;

    const publicId = `company/${companyId}/project/${projectId || 'lead'}/${leadId || 'project'}/documents/${Date.now()}/v${version}.pdf`;

    const uploadResult = await this.uploadToCloudinary(pdfBuffer, publicId);

    const document = await Document.create({
      companyId,
      projectId,
      leadId,
      templateId,
      type: template.type,
      version,
      status: 'draft',
      fileUrl: uploadResult.secure_url,
      checksum,
      createdBy: userId
    });

    await DocumentVariable.create({
      documentId: document.id,
      variables
    });

    // Audit
    await AuditLog.create({
      companyId,
      userId,
      action: 'DOCUMENT_CREATED',
      entityType: 'Document',
      entityId: document.id,
      details: { templateId, version },
      ipAddress: '',
      userAgent: ''
    });

    return document;
  }

  // Other methods for signing, etc.
}

module.exports = DocumentService;