const { Op } = require('sequelize');
const Roster = require('./roster.model');
const DoctorProfile = require('../doctor/doctor.model');
const User = require('../user/user.model');
const Shift = require('../shift/shift.model');

const includeConfig = [
  {
    model: DoctorProfile,
    as: 'doctor',
    include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'avatar', 'phone'] }],
    attributes: ['id', 'title']
  },
  {
    model: Shift,
    as: 'shift',
  }
];

const rosterRepository = {
  async create(data) {
    return Roster.create(data);
  },
  async findById(id) {
    return Roster.findByPk(id, { include: includeConfig });
  },
  async findAll({ offset, limit, doctorProfileId, shiftId, status, startDate, endDate }) {
    const where = {};
    if (doctorProfileId) where.doctor_profile_id = doctorProfileId;
    if (shiftId) where.shift_id = shiftId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.roster_date = {};
      if (startDate) where.roster_date[Op.gte] = startDate;
      if (endDate) where.roster_date[Op.lte] = endDate;
    }
    const { count, rows } = await Roster.findAndCountAll({
      where,
      limit,
      offset,
      include: includeConfig,
      order: [['roster_date', 'DESC']],
    });
    return { total: count, rosters: rows };
  },
  async update(id, data) {
    await Roster.update(data, { where: { id } });
    return this.findById(id);
  },
  async remove(id) {
    return Roster.destroy({ where: { id } });
  },
  async checkDuplicate(doctorProfileId, shiftId, rosterDate) {
    return Roster.findOne({ where: { doctor_profile_id: doctorProfileId, shift_id: shiftId, roster_date: rosterDate } });
  },
  async getAvailableDoctors(date, shiftId) {
    const where = { roster_date: date, status: 'approved' };
    if (shiftId) where.shift_id = shiftId;
    
    const rosters = await Roster.findAll({
      where,
      include: [
        {
          model: DoctorProfile,
          as: 'doctor',
          include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'avatar', 'phone'] }],
          attributes: ['id', 'title']
        }
      ]
    });
    return rosters.map(r => r.doctor);
  },
  async doctorHasApprovedRoster(doctorProfileId, date) {
    const count = await Roster.count({
      where: {
        doctor_profile_id: doctorProfileId,
        roster_date: date,
        status: 'approved'
      }
    });
    return count > 0;
  }
};

module.exports = rosterRepository;