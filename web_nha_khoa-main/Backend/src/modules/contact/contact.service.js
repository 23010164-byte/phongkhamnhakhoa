const { Op } = require('sequelize');
const Contact = require('./contact.model');
const User = require('../user/user.model');
const { AppError } = require('../../middlewares/error.middleware');
const { getPagination } = require('../../utils/helpers');
const { sendMail } = require('../../config/mailer');
const logger = require('../../utils/logger');

const contactService = {
  async submit({ fullName, email, phone, subject, message, ipAddress }) {
    const contact = await Contact.create({
      full_name: fullName,
      email,
      phone,
      subject,
      message,
      ip_address: ipAddress,
      status: 'new',
    });

    // Gửi email xác nhận cho người liên hệ (non-blocking)
    sendMail({
      to: email,
      subject: `Xác nhận nhận được liên hệ: ${subject}`,
      html: `
        <h2>Xin chào ${fullName},</h2>
        <p>Chúng tôi đã nhận được liên hệ của bạn với nội dung:</p>
        <blockquote style="border-left:3px solid #2563eb;padding-left:16px;color:#555;margin:16px 0;">
          ${message}
        </blockquote>
        <p>Đội ngũ của chúng tôi sẽ phản hồi trong vòng <strong>24 giờ làm việc</strong>.</p>
        <p>Trân trọng,<br/><strong>Phòng Khám</strong></p>
      `,
    }).catch((e) => logger.warn('Gửi email xác nhận liên hệ thất bại:', e.message));

    // Alert nội bộ cho admin
    sendMail({
      to: process.env.SMTP_USER,
      subject: `[Liên hệ mới] ${subject} — ${fullName}`,
      html: `
        <h3>📬 Có liên hệ mới từ website</h3>
        <table style="border-collapse:collapse;width:100%;max-width:600px;">
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;width:120px;">Họ tên</td><td style="padding:8px;border:1px solid #ddd;">${fullName}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${email}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">SĐT</td><td style="padding:8px;border:1px solid #ddd;">${phone || 'Không có'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Chủ đề</td><td style="padding:8px;border:1px solid #ddd;">${subject}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Nội dung</td><td style="padding:8px;border:1px solid #ddd;">${message}</td></tr>
        </table>
      `,
    }).catch(() => {});

    return contact;
  },

  async getAll(query) {
    const { page, limit, offset } = getPagination(query);
    const { status, search } = query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { subject: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Contact.findAndCountAll({
      where,
      include: [{ model: User, as: 'assignee', attributes: ['id', 'full_name'], required: false }],
      limit,
      offset,
      order: [['created_at', 'DESC']],
      distinct: true,
    });

    return { total: count, contacts: rows };
  },

  async getById(id) {
    const contact = await Contact.findByPk(id, {
      include: [{ model: User, as: 'assignee', attributes: ['id', 'full_name'], required: false }],
    });
    if (!contact) throw new AppError('Không tìm thấy liên hệ', 404);
    return contact;
  },

  async updateStatus(id, { status, assignedTo }) {
    const contact = await Contact.findByPk(id);
    if (!contact) throw new AppError('Không tìm thấy liên hệ', 404);
    await contact.update({ status, assigned_to: assignedTo || contact.assigned_to });
    return this.getById(id);
  },

  async reply(id, replyText) {
    const contact = await Contact.findByPk(id);
    if (!contact) throw new AppError('Không tìm thấy liên hệ', 404);

    await sendMail({
      to: contact.email,
      subject: `Re: ${contact.subject}`,
      html: `
        <h2>Xin chào ${contact.full_name},</h2>
        <p>Cảm ơn bạn đã liên hệ với chúng tôi. Đây là phản hồi của chúng tôi:</p>
        <div style="background:#f8f9fa;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #2563eb;">
          ${replyText}
        </div>
        <p>Nếu bạn cần hỗ trợ thêm, vui lòng liên hệ lại.</p>
        <p>Trân trọng,<br/><strong>Phòng Khám</strong></p>
      `,
    });

    await contact.update({
      reply: replyText,
      replied_at: new Date(),
      status: 'resolved',
    });

    return this.getById(id);
  },

  async delete(id) {
    const contact = await Contact.findByPk(id);
    if (!contact) throw new AppError('Không tìm thấy liên hệ', 404);
    await contact.destroy();
    return true;
  },
};

module.exports = contactService;
