const rosterRepository = require('./roster.repository');
const holidayRepository = require('../holiday/holiday.repository');
const shiftRepository = require('../shift/shift.repository');
const doctorRepository = require('../doctor/doctor.repository');
const { AppError } = require('../../middlewares/error.middleware');
const { getPagination } = require('../../utils/helpers');
const { ROLES, ROSTER_STATUS } = require('../../utils/constants');

const rosterService = {
  async create(data, user) {
    // Nếu là bác sĩ tạo, đảm bảo chỉ tạo cho mình
    let { doctor_profile_id, shift_id, roster_date, note } = data;
    
    if (user.role === ROLES.DOCTOR) {
      const doctor = await doctorRepository.findByUserId(user.id);
      if (!doctor) throw new AppError('Không tìm thấy hồ sơ bác sĩ', 404);
      doctor_profile_id = doctor.id;
    }

    // Check holiday
    const isHoliday = await holidayRepository.isHoliday(roster_date);
    if (isHoliday) throw new AppError('Ngày này là ngày nghỉ của phòng khám', 400);

    // Check doctor leave
    const leaveRepository = require('../leave/leave.repository');
    const existingLeave = await leaveRepository.findByDoctorAndDate(doctor_profile_id, roster_date);
    if (existingLeave && existingLeave.status !== 'rejected') {
      throw new AppError('Bạn đã xin nghỉ vào ngày này nên không thể đăng ký ca làm việc', 400);
    }

    // Check shift exists
    const shift = await shiftRepository.findById(shift_id);
    if (!shift || !shift.is_active) throw new AppError('Ca làm việc không hợp lệ hoặc đã bị vô hiệu hóa', 400);

    // Check duplicate
    const exists = await rosterRepository.checkDuplicate(doctor_profile_id, shift_id, roster_date);
    if (exists) throw new AppError('Lịch trực này đã được đăng ký', 400);

    // Mặc định tạo ra pending, nếu admin tạo thì approved luôn
    const status = user.role === ROLES.ADMIN ? ROSTER_STATUS.APPROVED : ROSTER_STATUS.PENDING;

    return rosterRepository.create({ doctor_profile_id, shift_id, roster_date, note, status });
  },
  
  async approve(id) {
    const roster = await rosterRepository.findById(id);
    if (!roster) throw new AppError('Không tìm thấy lịch trực', 404);
    if (roster.status !== ROSTER_STATUS.PENDING) throw new AppError('Chỉ có thể duyệt lịch chờ xử lý', 400);
    return rosterRepository.update(id, { status: ROSTER_STATUS.APPROVED });
  },

  async reject(id) {
    const roster = await rosterRepository.findById(id);
    if (!roster) throw new AppError('Không tìm thấy lịch trực', 404);
    if (roster.status !== ROSTER_STATUS.PENDING) throw new AppError('Chỉ có thể từ chối lịch chờ xử lý', 400);
    return rosterRepository.update(id, { status: ROSTER_STATUS.REJECTED });
  },

  async remove(id) {
    const roster = await rosterRepository.findById(id);
    if (!roster) throw new AppError('Không tìm thấy lịch trực', 404);
    return rosterRepository.remove(id);
  },

  async getAll(query, user) {
    const { page, limit, offset } = getPagination(query);
    const { shiftId, status, startDate, endDate } = query;
    let doctorProfileId = query.doctorProfileId;

    if (user.role === ROLES.DOCTOR) {
      // Allow doctors to view all rosters to see who is working, but if they explicitly pass doctorProfileId, respect it.
      // Do not force it.
    }

    const { total, rosters } = await rosterRepository.findAll({
      offset, limit, doctorProfileId, shiftId, status, startDate, endDate
    });
    return { total, rosters };
  },

  async getById(id, user) {
    const roster = await rosterRepository.findById(id);
    if (!roster) throw new AppError('Không tìm thấy lịch trực', 404);

    if (user.role === ROLES.DOCTOR) {
      const doctor = await doctorRepository.findByUserId(user.id);
      if (roster.doctor_profile_id !== doctor?.id) {
        throw new AppError('Bạn không có quyền xem lịch trực này', 403);
      }
    }
    return roster;
  },

  async getAvailableDoctors(date, shiftId) {
    if (!date) throw new AppError('Vui lòng chọn ngày', 400);
    return rosterRepository.getAvailableDoctors(date, shiftId);
  }
};

module.exports = rosterService;