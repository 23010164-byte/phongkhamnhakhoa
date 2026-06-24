const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT) || 587,
    secure: process.env.MAIL_SECURE === 'true', // true cho port 465
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 10, // 10 emails/giây
  });

  return transporter;
};

/**
 * Gửi email
 * @param {Object} options - { to, subject, html, text, from }
 */
const sendMail = async ({ to, subject, html, text, from }) => {
  try {
    const t = getTransporter();
    const result = await t.sendMail({
      from: from || `"${process.env.MAIL_FROM_NAME || 'Phòng Khám'}" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
      text,
    });
    logger.info(`📧 Email gửi thành công tới ${to} — messageId: ${result.messageId}`);
    return result;
  } catch (error) {
    logger.error(`📧 Gửi email thất bại tới ${to}:`, error.message);
    throw error;
  }
};

/**
 * Verify kết nối mail server
 */
const verifyMailer = async () => {
  try {
    await getTransporter().verify();
    logger.info('✅ Mail server kết nối thành công');
    return true;
  } catch (error) {
    logger.warn('⚠️  Mail server không khả dụng:', error.message);
    return false;
  }
};

module.exports = { sendMail, verifyMailer };
