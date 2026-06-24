const { Op } = require('sequelize');
const Review = require('./review.model');
const User = require('../user/user.model');
const DoctorProfile = require('../doctor/doctor.model');
const Appointment = require('../appointment/appointment.model');
const { sequelize } = require('../../config/database');

const patientAttrs = ['id', 'full_name', 'avatar'];
const doctorUserAttrs = ['id', 'full_name', 'avatar'];

const reviewRepository = {
  async create(data) {
    return Review.create(data);
  },

  async findById(id) {
    return Review.findByPk(id, {
      include: [
        { model: User, as: 'patient', attributes: patientAttrs },
        {
          model: DoctorProfile,
          as: 'doctor',
          attributes: ['id', 'title'],
          include: [{ model: User, as: 'user', attributes: doctorUserAttrs }],
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'booking_code', 'appointment_date'],
        },
      ],
    });
  },

  async findByAppointmentId(appointmentId) {
    return Review.findOne({ where: { appointment_id: appointmentId } });
  },

  async findAll({ offset, limit, doctorProfileId, patientId, rating, isVisible }) {
    const where = {};
    if (doctorProfileId) where.doctor_profile_id = doctorProfileId;
    if (patientId) where.patient_id = patientId;
    if (rating) where.rating = parseInt(rating);
    if (typeof isVisible !== 'undefined') where.is_visible = isVisible;

    const { count, rows } = await Review.findAndCountAll({
      where,
      include: [
        { model: User, as: 'patient', attributes: patientAttrs },
        {
          model: DoctorProfile,
          as: 'doctor',
          attributes: ['id', 'title'],
          include: [{ model: User, as: 'user', attributes: doctorUserAttrs }],
        },
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
      distinct: true,
    });

    return { total: count, reviews: rows };
  },

  async update(id, data) {
    await Review.update(data, { where: { id } });
    return this.findById(id);
  },

  async delete(id) {
    return Review.destroy({ where: { id } });
  },

  async getRatingSummary(doctorProfileId) {
    const result = await Review.findOne({
      where: { doctor_profile_id: doctorProfileId, is_visible: true },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avg'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN rating = 5 THEN 1 ELSE 0 END")), 'five'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN rating = 4 THEN 1 ELSE 0 END")), 'four'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN rating = 3 THEN 1 ELSE 0 END")), 'three'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN rating = 2 THEN 1 ELSE 0 END")), 'two'],
        [sequelize.fn('SUM', sequelize.literal("CASE WHEN rating = 1 THEN 1 ELSE 0 END")), 'one'],
      ],
      raw: true,
    });

    return {
      avg: parseFloat(parseFloat(result?.avg || 0).toFixed(2)),
      total: parseInt(result?.total || 0),
      distribution: {
        5: parseInt(result?.five || 0),
        4: parseInt(result?.four || 0),
        3: parseInt(result?.three || 0),
        2: parseInt(result?.two || 0),
        1: parseInt(result?.one || 0),
      },
    };
  },
};

module.exports = reviewRepository;
