const leaveRepository = require('./leave.repository');
const doctorRepository = require('../doctor/doctor.repository');
const Roster = require('../roster/roster.model');
const { AppError } = require('../../middlewares/error.middleware');
const { LEAVE_STATUS } = require('../../utils/constants');

class LeaveService {
  async createLeave(userId, data) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) throw new AppError('Bạn không phải là bác sĩ', 403);

    const existingLeave = await leaveRepository.findByDoctorAndDate(doctor.id, data.leave_date);
    if (existingLeave) {
      throw new AppError('Bạn đã xin nghỉ vào ngày này rồi', 400);
    }

    return await leaveRepository.create({
      doctor_profile_id: doctor.id,
      leave_date: data.leave_date,
      reason: data.reason,
      status: LEAVE_STATUS.PENDING,
    });
  }

  async getLeavesByUser(userId, role) {
    if (role === 'admin') {
      return await leaveRepository.findAll({});
    }

    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) throw new AppError('Bạn không phải là bác sĩ', 403);

    return await leaveRepository.findAll({ doctor_profile_id: doctor.id });
  }

  async updateLeaveStatus(leaveId, status, rejectionReason) {
    const leave = await leaveRepository.findById(leaveId);
    if (!leave) throw new AppError('Không tìm thấy đơn xin nghỉ', 404);

    if (leave.status !== LEAVE_STATUS.PENDING) {
      throw new AppError('Đơn xin nghỉ này đã được xử lý', 400);
    }

    if (status === LEAVE_STATUS.REJECTED && !rejectionReason) {
      throw new AppError('Vui lòng nhập lý do từ chối', 400);
    }

    const updatedLeave = await leaveRepository.update(leaveId, {
      status,
      rejection_reason: status === LEAVE_STATUS.REJECTED ? rejectionReason : null,
    });

    // Nếu duyệt nghỉ, xóa các ca làm việc (roster) của bác sĩ trong ngày đó
    // Yêu cầu: bệnh nhân đã đặt lịch thì kệ, lễ tân sẽ tự liên hệ.
    if (status === LEAVE_STATUS.APPROVED) {
      await Roster.destroy({
        where: {
          doctor_profile_id: leave.doctor_profile_id,
          roster_date: leave.leave_date,
        },
      });
    }

    return updatedLeave;
  }
}

module.exports = new LeaveService();
