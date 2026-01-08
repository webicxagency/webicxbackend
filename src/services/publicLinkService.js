const jwt = require('jsonwebtoken');

class PublicLinkService {
  static generateSigningLink(documentId) {
    const token = jwt.sign({ documentId, type: 'sign' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return `${process.env.BASE_URL}/public/sign/${token}`;
  }

  static generatePaymentLink(milestoneId) {
    const token = jwt.sign({ milestoneId, type: 'pay' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return `${process.env.BASE_URL}/public/pay/${milestoneId}/${token}`;
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = PublicLinkService;