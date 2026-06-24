const { Op } = require('sequelize');
const DoctorProfile = require('./doctor.model');
const User = require('../user/user.model');
const { sequelize } = require('../../config/database');

// Attributes dùng chung khi include User
const userAttrs = ['id', 'full_name', 'email', 'phone', 'avatar', 'gender', 'is_active'];

const doctorRepository = {
  async findAll({ offset, limit, specialtyId, isAvailable, search, day }) {
    const profileWhere = {};
    if (typeof isAvailable !== 'undefined') profileWhere.is_available = isAvailable;
    if (specialtyId) profileWhere.specialty_id = specialtyId;
    if (day) profileWhere.working_days = { [Op.like]: `%${day}%` };

    const userWhere = { is_active: true };
    if (search) {
      userWhere.full_name = { [Op.like]: `%${search}%` };
    }

    const { count, rows } = await DoctorProfile.findAndCountAll({
      where: profileWhere,
      include: [
        { model: User, as: 'user', where: userWhere, attributes: userAttrs },
        {
          model: require('../service/specialty.model'),
          as: 'specialty',
          attributes: ['id', 'name', 'icon'],
        },
      ],
      limit,
      offset,
      order: [['rating_avg', 'DESC']],
      distinct: true,
    });

    return { total: count, doctors: rows };
  },

  async findByUserId(userId) {
    return DoctorProfile.findOne({
      where: { user_id: userId },
      include: [
        { model: User, as: 'user', attributes: userAttrs },
        { model: require('../service/specialty.model'), as: 'specialty' },
      ],
    });
  },

  async findById(id) {
    return DoctorProfile.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: userAttrs },
        { model: require('../service/specialty.model'), as: 'specialty' },
      ],
    });
  },

  async create(data) {
    return DoctorProfile.create(data);
  },

  async update(id, data) {
    await DoctorProfile.update(data, { where: { id } });
    return this.findById(id);
  },

  async updateByUserId(userId, data) {
    await DoctorProfile.update(data, { where: { user_id: userId } });
    return this.findByUserId(userId);
  },

  async updateRating(doctorProfileId) {
    // Tính lại rating trung bình từ bảng reviews
    const Review = require('../review/review.model');
    const result = await Review.findOne({
      where: { doctor_profile_id: doctorProfileId, is_visible: true },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avg'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      raw: true,
    });
    const avg = parseFloat(result?.avg || 0).toFixed(2);
    const count = parseInt(result?.count || 0);
    await DoctorProfile.update(
      { rating_avg: avg, rating_count: count },
      { where: { id: doctorProfileId } }
    );
  },

  // Lấy danh sách time slots trống trong một ngày
  async getAvailableSlots(doctorProfileId, date) {
    const doctor = await this.findById(doctorProfileId);
    if (!doctor) return null;

    const dayjs = require('dayjs');
    const { parseTime } = require('../../utils/helpers');
    const Appointment = require('../appointment/appointment.model');
    const { APPOINTMENT_STATUS } = require('../../utils/constants');

    const dayOfWeek = dayjs(date).format('dddd').toLowerCase();
    if (!doctor.working_days.includes(dayOfWeek)) return [];

    // Lấy các slot đã đặt
    const booked = await Appointment.findAll({
      where: {
        doctor_profile_id: doctorProfileId,
        appointment_date: date,
        status: {
          [Op.notIn]: [
            APPOINTMENT_STATUS.CANCELLED,
            APPOINTMENT_STATUS.NO_SHOW,
          ],
        },
      },
      attributes: ['appointment_time'],
      raw: true,
    });
    const bookedTimes = new Set(booked.map((a) => a.appointment_time));

    // Sinh danh sách slots
    const slots = [];
    const { hours: startH, minutes: startM } = parseTime(doctor.working_start);
    const { hours: endH, minutes: endM } = parseTime(doctor.working_end);
    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + doctor.slot_duration_minutes <= end) {
      const h = String(Math.floor(current / 60)).padStart(2, '0');
      const m = String(current % 60).padStart(2, '0');
      const timeStr = `${h}:${m}`;
      slots.push({
        time: timeStr,
        isBooked: bookedTimes.has(timeStr),
      });
      current += doctor.slot_duration_minutes;
    }

    return slots;
  },
};

module.exports = doctorRepository;
