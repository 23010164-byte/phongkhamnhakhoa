const Leave = require('./leave.model');
const DoctorProfile = require('../doctor/doctor.model');
const User = require('../user/user.model');

class LeaveRepository {
  async create(data) {
    return await Leave.create(data);
  }

  async findById(id) {
    return await Leave.findByPk(id, {
      include: [
        {
          model: DoctorProfile,
          as: 'doctor',
          include: [{ model: User, as: 'user', attributes: ['full_name', 'email', 'phone'] }],
        },
      ],
    });
  }

  async findAll(query) {
    return await Leave.findAll({
      where: query,
      include: [
        {
          model: DoctorProfile,
          as: 'doctor',
          include: [{ model: User, as: 'user', attributes: ['full_name', 'email', 'phone'] }],
        },
      ],
      order: [['leave_date', 'DESC']],
    });
  }

  async update(id, data) {
    await Leave.update(data, { where: { id } });
    return await this.findById(id);
  }

  async findByDoctorAndDate(doctorProfileId, leaveDate) {
    return await Leave.findOne({
      where: {
        doctor_profile_id: doctorProfileId,
        leave_date: leaveDate,
      },
    });
  }
}

module.exports = new LeaveRepository();
