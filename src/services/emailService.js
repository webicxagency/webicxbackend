const nodemailer = require('nodemailer');

class EmailService {
  static async sendInvoiceEmail(client, invoice, paymentUrl, pdfBuffer) {
    try {
      console.log('EmailService.sendInvoiceEmail called for client:', client.email, 'invoice:', invoice.id);
      console.log('Email configuration:', {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE,
        user: process.env.EMAIL_USER ? '***' : 'NOT SET',
        pass: process.env.EMAIL_PASS ? '***' : 'NOT SET',
        from: process.env.EMAIL_FROM
      });

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      console.log('Email transporter created, verifying connection...');

      // Verify connection
      await transporter.verify();
      console.log('Email transporter verified successfully');

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: client.email,
        subject: `Invoice ${invoice.invoice_number} from PrimeGraphics`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Invoice ${invoice.invoice_number}</h2>
            <p>Dear ${client.contact_person},</p>
            <p>Please find attached your invoice from PrimeGraphics.</p>

            <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
              <h3>Invoice Details</h3>
              <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
              <p><strong>Total Amount:</strong> GHS ${invoice.total}</p>
              <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${invoice.pdf_url}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">View Invoice</a>
              <a href="${paymentUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Pay Now</a>
            </div>

            <p>If you have any questions, please contact us at info@primegraphics.com</p>

            <p>Thank you for your business!</p>
            <p>PrimeGraphics Team</p>
          </div>
        `,
        attachments: [
          {
            filename: `Invoice-${invoice.invoice_number}.pdf`,
            content: pdfBuffer
          }
        ]
      };

      console.log('Sending email to:', client.email);
      const result = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);

      return result;
    } catch (error) {
      console.error('EmailService.sendInvoiceEmail ERROR:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response
      });
      throw error; // Re-throw to be handled by caller
    }
  }
}

module.exports = EmailService;