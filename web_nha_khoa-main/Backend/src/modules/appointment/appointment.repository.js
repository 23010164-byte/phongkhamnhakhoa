const { Op } = require('sequelize');
const Appointment = require('./appointment.model');
const User = require('../user/user.model');
const DoctorProfile = require('../doctor/doctor.model');
const Service = require('../service/service.model');
const { APPOINTMENT_STATUS } = require('../../utils/constants');

const patientAttrs = ['id', 'full_name', 'email', 'phone', 'avatar', 'gender', 'date_of_birth'];
const doctorUserAttrs = ['id', 'full_name', 'avatar', 'phone'];

const defaultIncludes = [
  { model: User, as: 'patient', attributes: patientAttrs },
  {
    model: DoctorProfile,
    as: 'doctor',
    include: [{ model: User, as: 'user', attributes: doctorUserAttrs }],
    attributes: ['id', 'title', 'consultation_fee'],
  },
  { model: Service, as: 'service', attributes: ['id', 'name', 'price', 'duration_minutes'] },
];

const appointmentRepository = {
  async create(data) {
    return Appointment.create(data);
  },

  async findById(id) {
    return Appointment.findByPk(id, { include: defaultIncludes });
  },

  async findByBookingCode(code) {
    return Appointment.findOne({ where: { booking_code: code }, include: defaultIncludes });
  },

  async findAll({ offset, limit, patientId, doctorProfileId, status, date, startDate, endDate, paymentStatus }) {
    const where = {};
    if (patientId) where.patient_id = patientId;
    if (doctorProfileId) where.doctor_profile_id = doctorProfileId;
    if (status) where.status = status;
    if (paymentStatus) where.payment_status = paymentStatus;
    if (date) {
      where.appointment_date = date;
    } else if (startDate || endDate) {
      where.appointment_date = {};
      if (startDate) where.appointment_date[Op.gte] = startDate;
      if (endDate) where.appointment_date[Op.lte] = endDate;
    }

    const { count, rows } = await Appointment.findAndCountAll({
      where,
      include: defaultIncludes,
      limit,
      offset,
      order: [['appointment_date', 'DESC'], ['appointment_time', 'ASC']],
      distinct: true,
    });

    return { total: count, appointments: rows };
  },

  async checkSlotConflict(doctorProfileId, date, time, excludeId = null) {
    const where = {
      doctor_profile_id: doctorProfileId,
      appointment_date: date,
      appointment_time: time,
      status: { [Op.notIn]: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW] },
    };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    return Appointment.findOne({ where });
  },

  async countByDoctorAndDate(doctorProfileId, date) {
    return Appointment.count({
      where: {
        doctor_profile_id: doctorProfileId,
        appointment_date: date,
        status: { [Op.notIn]: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.NO_SHOW] },
      },
    });
  },

  async getMaxQueueNumber(doctorProfileId, date) {
    const result = await Appointment.max('queue_number', {
      where: { doctor_profile_id: doctorProfileId, appointment_date: date },
    });
    return result || 0;
  },

  async update(id, data) {
    await Appointment.update(data, { where: { id } });
    return this.findById(id);
  },

  // Lấy appointments cần nhắc nhở (1 ngày trước)
  async findPendingReminders(targetDate) {
    return Appointment.findAll({
      where: {
        appointment_date: targetDate,
        status: { [Op.in]: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED] },
        reminder_sent: false,
      },
      include: [
        { model: User, as: 'patient', attributes: ['id', 'full_name', 'email', 'phone'] },
        {
          model: DoctorProfile,
          as: 'doctor',
          include: [{ model: User, as: 'user', attributes: ['full_name'] }],
        },
      ],
    });
  },

  async getStatsByStatus(startDate, endDate) {
    const { sequelize } = require('../../config/database');
    return Appointment.findAll({
      where: { appointment_date: { [Op.between]: [startDate, endDate] } },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });
  },
};

module.exports = appointmentRepository;
