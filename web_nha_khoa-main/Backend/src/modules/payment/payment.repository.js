const { Op } = require('sequelize');
const Payment = require('./payment.model');
const User = require('../user/user.model');
const Appointment = require('../appointment/appointment.model');
const { MedicalRecord } = require('../medical/medical.model');

const defaultIncludes = [
  { model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'phone'] },
  {
    model: Appointment,
    as: 'appointment',
    attributes: ['id', 'booking_code', 'appointment_date', 'appointment_time'],
    include: [{ model: MedicalRecord, as: 'medicalRecord', attributes: ['id'] }],
  },
];

const paymentRepository = {
  async create(data) {
    return Payment.create(data);
  },

  async findById(id) {
    return Payment.findByPk(id, { include: defaultIncludes });
  },

  async findByTransactionCode(code) {
    return Payment.findOne({ where: { transaction_code: code }, include: defaultIncludes });
  },

  async findByAppointmentId(appointmentId) {
    return Payment.findOne({
      where: { appointment_id: appointmentId },
      include: defaultIncludes,
      order: [['created_at', 'DESC']],
    });
  },

  async findByMedicalRecordId(medicalRecordId) {
    return Payment.findOne({
      where: { medical_record_id: medicalRecordId },
      include: defaultIncludes,
      order: [['created_at', 'DESC']],
    });
  },

  async findAll({ userId, status, method, startDate, endDate, offset, limit }) {
    const where = {};
    if (userId) where.user_id = userId;
    if (status) where.status = status;
    if (method) where.method = method;
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at[Op.gte] = new Date(startDate);
      if (endDate) where.created_at[Op.lte] = new Date(endDate);
    }

    const { count, rows } = await Payment.findAndCountAll({
      where,
      include: defaultIncludes,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      distinct: true,
    });

    return { total: count, payments: rows };
  },

  async update(id, data) {
    await Payment.update(data, { where: { id } });
    return this.findById(id);
  },

  async sumRevenue({ startDate, endDate }) {
    const { sequelize } = require('../../config/database');
    const { PAYMENT_STATUS } = require('../../utils/constants');
    const result = await Payment.findOne({
      where: {
        status: PAYMENT_STATUS.PAID,
        paid_at: { [Op.between]: [new Date(startDate), new Date(endDate)] },
      },
      attributes: [[sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      raw: true,
    });
    return parseFloat(result?.total || 0);
  },
};

module.exports = paymentRepository;
