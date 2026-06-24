const notificationRepository = require('./notification.repository');
const { AppError } = require('../../middlewares/error.middleware');
const { getPagination } = require('../../utils/helpers');
const { NOTIFICATION_TYPE, NOTIFICATION_CHANNEL } = require('../../utils/constants');
const { sendMail } = require('../../config/mailer');
const emailTemplates = require('../../utils/emailTemplates');
const logger = require('../../utils/logger');

const notificationService = {
  // --------------------
  // TẠO VÀ GỬI THÔNG BÁO
  // --------------------
  async send({ userId, type, title, body, data = null, channels = [NOTIFICATION_CHANNEL.IN_APP] }) {
    const created = [];

    for (const channel of channels) {
      try {
        // 1. Lưu vào DB (in-app)
        if (channel === NOTIFICATION_CHANNEL.IN_APP) {
          const notif = await notificationRepository.create({
            user_id: userId,
            type,
            title,
            body,
            data,
            channel,
          });
          created.push(notif);

          // Push qua Socket.io nếu đang kết nối
          this._pushSocketNotification(userId, notif);
        }

        // 2. Gửi email
        if (channel === NOTIFICATION_CHANNEL.EMAIL && data?.email) {
          await sendMail({
            to: data.email,
            subject: title,
            html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;">
              <h2>${title}</h2>
              <p>${body}</p>
              ${data.actionUrl ? `<a href="${data.actionUrl}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:16px;">Xem chi tiết</a>` : ''}
              <hr style="margin-top:32px;"/>
              <p style="color:#888;font-size:12px;">Phòng Khám — Đây là email tự động, vui lòng không reply.</p>
            </div>`,
          }).catch((err) => logger.warn(`Gửi email notification thất bại [${type}]:`, err.message));
        }
      } catch (err) {
        logger.error(`Gửi notification thất bại [channel=${channel}]:`, err.message);
      }
    }

    return created[0] || null;
  },

  // Gửi hàng loạt cho nhiều user
  async sendBulk(userIds, { type, title, body, data }) {
    const items = userIds.map((userId) => ({
      user_id: userId,
      type,
      title,
      body,
      data,
      channel: NOTIFICATION_CHANNEL.IN_APP,
    }));
    const created = await notificationRepository.bulkCreate(items);

    // Push socket cho tất cả
    userIds.forEach((userId) => {
      const notif = created.find((n) => n.user_id === userId);
      if (notif) this._pushSocketNotification(userId, notif);
    });

    return created;
  },

  // --------------------
  // TEMPLATE NOTIFICATIONS
  // --------------------
  async notifyAppointmentBooked(appointment, patientEmail) {
    // Send email riêng với template đẹp
    if (patientEmail) {
      sendMail({
        to: patientEmail,
        subject: `✅ Đặt lịch thành công - Mã: ${appointment.booking_code}`,
        html: emailTemplates.appointmentBooked({
          fullName: appointment.patient?.full_name || 'Bệnh nhân',
          bookingCode: appointment.booking_code,
          doctorName: appointment.doctor?.user?.full_name || 'Bác sĩ',
          date: appointment.appointment_date,
          time: appointment.appointment_time,
          serviceName: appointment.service?.name,
        }),
      }).catch(() => {});
    }
    // In-app notification
    return this.send({
      userId: appointment.patient_id,
      type: NOTIFICATION_TYPE.APPOINTMENT_CONFIRMED,
      title: 'Đặt lịch hẹn thành công',
      body: `Lịch hẹn ngày ${appointment.appointment_date} lúc ${appointment.appointment_time} đã được tạo. Mã: ${appointment.booking_code}`,
      data: { appointmentId: appointment.id, bookingCode: appointment.booking_code },
      channels: [NOTIFICATION_CHANNEL.IN_APP],
    });
  },

  async notifyAppointmentConfirmed(appointment, patientEmail) {
    if (patientEmail) {
      sendMail({
        to: patientEmail,
        subject: `🎉 Lịch hẹn đã xác nhận - ${appointment.booking_code}`,
        html: emailTemplates.appointmentConfirmed({
          fullName: appointment.patient?.full_name || 'Bệnh nhân',
          bookingCode: appointment.booking_code,
          doctorName: appointment.doctor?.user?.full_name || 'Bác sĩ',
          date: appointment.appointment_date,
          time: appointment.appointment_time,
          queueNumber: appointment.queue_number,
        }),
      }).catch(() => {});
    }
    return this.send({
      userId: appointment.patient_id,
      type: NOTIFICATION_TYPE.APPOINTMENT_CONFIRMED,
      title: 'Lịch hẹn đã được xác nhận',
      body: `Lịch khám ngày ${appointment.appointment_date} lúc ${appointment.appointment_time} đã xác nhận. STT: ${appointment.queue_number}`,
      data: { appointmentId: appointment.id },
      channels: [NOTIFICATION_CHANNEL.IN_APP],
    });
  },

  async notifyAppointmentCancelled(appointment, patientEmail, reason) {
    return this.send({
      userId: appointment.patient_id,
      type: NOTIFICATION_TYPE.APPOINTMENT_CANCELLED,
      title: 'Lịch hẹn đã bị hủy',
      body: `Lịch khám ngày ${appointment.appointment_date} lúc ${appointment.appointment_time} đã bị hủy. Lý do: ${reason || 'Không có lý do'}`,
      data: { appointmentId: appointment.id, email: patientEmail },
      channels: [NOTIFICATION_CHANNEL.IN_APP, NOTIFICATION_CHANNEL.EMAIL],
    });
  },

  async notifyAppointmentReminder(appointment, patientEmail) {
    if (patientEmail) {
      sendMail({
        to: patientEmail,
        subject: `🔔 Nhắc lịch khám ngày mai - ${appointment.appointment_date}`,
        html: emailTemplates.appointmentReminder({
          fullName: appointment.patient?.full_name || 'Bệnh nhân',
          doctorName: appointment.doctor?.user?.full_name || 'Bác sĩ',
          date: appointment.appointment_date,
          time: appointment.appointment_time,
          bookingCode: appointment.booking_code,
        }),
      }).catch(() => {});
    }
    return this.send({
      userId: appointment.patient_id,
      type: NOTIFICATION_TYPE.APPOINTMENT_REMINDER,
      title: 'Nhắc nhở lịch hẹn ngày mai',
      body: `Bạn có lịch khám vào ngày mai ${appointment.appointment_date} lúc ${appointment.appointment_time}.`,
      data: { appointmentId: appointment.id },
      channels: [NOTIFICATION_CHANNEL.IN_APP],
    });
  },

  async notifyPaymentSuccess(payment, patientEmail) {
    if (patientEmail) {
      const dayjs = require('dayjs');
      sendMail({
        to: patientEmail,
        subject: `💳 Thanh toán thành công - ${payment.transaction_code}`,
        html: emailTemplates.paymentSuccess({
          fullName: '',
          amount: payment.amount,
          transactionCode: payment.transaction_code,
          method: payment.method,
          date: dayjs(payment.paid_at || new Date()).format('DD/MM/YYYY HH:mm'),
        }),
      }).catch(() => {});
    }
    return this.send({
      userId: payment.user_id,
      type: NOTIFICATION_TYPE.PAYMENT_SUCCESS,
      title: 'Thanh toán thành công',
      body: `Thanh toán ${Number(payment.amount).toLocaleString('vi-VN')}đ thành công. Mã GD: ${payment.transaction_code}`,
      data: { paymentId: payment.id },
      channels: [NOTIFICATION_CHANNEL.IN_APP],
    });
  },

  // --------------------
  // CRUD NOTIFICATIONS
  // --------------------
  async getMyNotifications(userId, query) {
    const { page, limit, offset } = getPagination(query);
    const { isRead, type } = query;

    const result = await notificationRepository.findAll({
      userId,
      isRead: typeof isRead !== 'undefined' ? isRead === 'true' : undefined,
      type,
      offset,
      limit,
    });

    const unreadCount = await notificationRepository.countUnread(userId);

    return { ...result, unreadCount };
  },

  async markAsRead(id, userId) {
    const [affected] = await notificationRepository.markAsRead(id, userId);
    if (!affected) throw new AppError('Không tìm thấy thông báo', 404);
    return true;
  },

  async markAllAsRead(userId) {
    await notificationRepository.markAllAsRead(userId);
    return true;
  },

  async delete(id, userId) {
    const affected = await notificationRepository.delete(id, userId);
    if (!affected) throw new AppError('Không tìm thấy thông báo', 404);
    return true;
  },

  async deleteAll(userId) {
    await notificationRepository.deleteAll(userId);
    return true;
  },

  // --------------------
  // PRIVATE: Socket push
  // --------------------
  _pushSocketNotification(userId, notification) {
    try {
      // Dùng global io instance (sẽ setup ở Phase 5)
      const io = global.io;
      if (io) {
        io.to(`user:${userId}`).emit('notification', notification);
      }
    } catch {
      // Socket chưa init, bỏ qua
    }
  },
};

module.exports = notificationService;
