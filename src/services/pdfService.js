const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary').v2;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class PDFService {
  static async generateInvoicePDF(invoice, client) {
    let browser;

    try {
      // Launch Puppeteer safely (production-ready)
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();

      // Parse services safely
      let services = [];
      try {
        services = invoice.services ? JSON.parse(invoice.services) : [];
      } catch {
        services = [];
      }

      // Build table rows
      const serviceRows = services.map(service => {
        const qty = Number(service.quantity) || 1;
        const price = Number(service.price) || 0;
        const total = (qty * price).toFixed(2);

        return `
          <tr>
            <td>${service.service || 'Service'}</td>
            <td>${qty}</td>
            <td>GHS ${price.toFixed(2)}</td>
            <td>GHS ${total}</td>
          </tr>
        `;
      }).join('');

      // Invoice HTML
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; }
            .header { text-align: center; margin-bottom: 32px; }
            .company { font-size: 24px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background: #f2f2f2; }
            .totals { text-align: right; margin-top: 20px; }
            .total { font-size: 18px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">PrimeGraphics</div>
            <div>Professional Design Services</div>
            <div>Awoshie-NIC, Accra, Ghana</div>
            <div>+233 557 589 185 • info@primegraphics.com</div>
          </div>

          <h2>Invoice #${invoice.invoice_number}</h2>
          <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
          <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>

          <h3>Bill To</h3>
          <p>
            <strong>${client.business_name}</strong><br/>
            ${client.contact_person}<br/>
            ${client.address}<br/>
            ${client.phone} • ${client.email}
          </p>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${serviceRows}
            </tbody>
          </table>

          <div class="totals">
            <p>Subtotal: GHS ${Number(invoice.subtotal).toFixed(2)}</p>
            <p>Discount: GHS ${Number(invoice.discount || 0).toFixed(2)}</p>
            <p>Tax: GHS ${Number(invoice.tax || 0).toFixed(2)}</p>
            <p class="total">Total: GHS ${Number(invoice.total).toFixed(2)}</p>
          </div>

          <h3>Payment Instructions</h3>
          <p>Please complete payment by the due date using the secure payment link.</p>
        </body>
        </html>
      `;

      // Render HTML
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true
      });

      // Upload to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'auto',
            public_id: `invoices/${invoice.invoice_number}`,
            access_mode: 'public'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(pdfBuffer);
      });

      // Force-download URL for mobile apps
      const downloadUrl = uploadResult.secure_url.replace(
        '/auto/upload/',
        '/auto/upload/fl_attachment/'
      );

      return { url: downloadUrl };

    } finally {
      if (browser) await browser.close();
    }
  }
}

module.exports = PDFService;
