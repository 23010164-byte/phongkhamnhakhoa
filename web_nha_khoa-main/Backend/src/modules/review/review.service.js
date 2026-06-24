const reviewRepository = require('./review.repository');
const appointmentRepository = require('../appointment/appointment.repository');
const doctorRepository = require('../doctor/doctor.repository');
const { AppError } = require('../../middlewares/error.middleware');
const { getPagination } = require('../../utils/helpers');
const { ROLES, APPOINTMENT_STATUS } = require('../../utils/constants');

const reviewService = {
  // --------------------
  // TẠO ĐÁNH GIÁ
  // --------------------
  async create(data, requestUser) {
    const { appointmentId, rating, comment, isAnonymous } = data;

    // Lấy appointment
    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) throw new AppError('Không tìm thấy lịch hẹn', 404);

    // Chỉ bệnh nhân của lịch hẹn mới được đánh giá
    if (appointment.patient_id !== requestUser.id) {
      throw new AppError('Bạn không có quyền đánh giá lịch hẹn này', 403);
    }

    // Chỉ đánh giá được lịch đã hoàn thành
    if (appointment.status !== APPOINTMENT_STATUS.COMPLETED) {
      throw new AppError('Chỉ đánh giá được lịch khám đã hoàn thành', 400);
    }

    // Kiểm tra đã đánh giá chưa
    const existing = await reviewRepository.findByAppointmentId(appointmentId);
    if (existing) throw new AppError('Bạn đã đánh giá lịch khám này rồi', 409);

    const review = await reviewRepository.create({
      appointment_id: appointmentId,
      patient_id: requestUser.id,
      doctor_profile_id: appointment.doctor_profile_id,
      rating,
      comment,
      is_anonymous: isAnonymous || false,
      is_visible: true,
    });

    // Cập nhật rating trung bình của bác sĩ
    await doctorRepository.updateRating(appointment.doctor_profile_id);

    return review;
  },

  // --------------------
  // DANH SÁCH ĐÁNH GIÁ
  // --------------------
  async getAll(query, requestUser) {
    const { page, limit, offset } = getPagination(query);
    const { doctorProfileId, rating } = query;

    const filters = { doctorProfileId, rating, offset, limit, isVisible: true };

    // Admin xem được tất cả kể cả ẩn
    if (requestUser?.role === ROLES.ADMIN) delete filters.isVisible;

    // Patient chỉ xem review của mình
    if (requestUser?.role === ROLES.PATIENT) {
      filters.patientId = requestUser.id;
      delete filters.isVisible;
    }

    return reviewRepository.findAll(filters);
  },

  async getById(id) {
    const review = await reviewRepository.findById(id);
    if (!review) throw new AppError('Không tìm thấy đánh giá', 404);
    return review;
  },

  async getDoctorRatingSummary(doctorProfileId) {
    const doctor = await doctorRepository.findById(doctorProfileId);
    if (!doctor) throw new AppError('Không tìm thấy bác sĩ', 404);
    return reviewRepository.getRatingSummary(doctorProfileId);
  },

  // --------------------
  // CẬP NHẬT (patient sửa review của mình)
  // --------------------
  async update(id, data, requestUser) {
    const review = await reviewRepository.findById(id);
    if (!review) throw new AppError('Không tìm thấy đánh giá', 404);

    if (requestUser.role === ROLES.PATIENT && review.patient_id !== requestUser.id) {
      throw new AppError('Bạn không có quyền sửa đánh giá này', 403);
    }

    const { rating, comment, isAnonymous } = data;
    const updated = await reviewRepository.update(id, { rating, comment, is_anonymous: isAnonymous });

    // Cập nhật lại rating bác sĩ nếu rating thay đổi
    if (rating) await doctorRepository.updateRating(review.doctor_profile_id);

    return updated;
  },

  // --------------------
  // BÁC SĨ PHẢN HỒI
  // --------------------
  async reply(id, replyText, requestUser) {
    const review = await reviewRepository.findById(id);
    if (!review) throw new AppError('Không tìm thấy đánh giá', 404);

    // Kiểm tra bác sĩ phụ trách
    if (requestUser.role === ROLES.DOCTOR) {
      const myDoctor = await doctorRepository.findByUserId(requestUser.id);
      if (!myDoctor || myDoctor.id !== review.doctor_profile_id) {
        throw new AppError('Bạn không có quyền phản hồi đánh giá này', 403);
      }
    }

    return reviewRepository.update(id, {
      doctor_reply: replyText,
      doctor_replied_at: new Date(),
    });
  },

  // --------------------
  // ADMIN: ẨN/HIỆN review
  // --------------------
  async toggleVisibility(id) {
    const review = await reviewRepository.findById(id);
    if (!review) throw new AppError('Không tìm thấy đánh giá', 404);

    const updated = await reviewRepository.update(id, { is_visible: !review.is_visible });

    // Cập nhật rating bác sĩ sau khi ẩn/hiện
    await doctorRepository.updateRating(review.doctor_profile_id);

    return updated;
  },

  // --------------------
  // XÓA
  // --------------------
  async delete(id, requestUser) {
    const review = await reviewRepository.findById(id);
    if (!review) throw new AppError('Không tìm thấy đánh giá', 404);

    if (requestUser.role === ROLES.PATIENT && review.patient_id !== requestUser.id) {
      throw new AppError('Bạn không có quyền xóa đánh giá này', 403);
    }

    await reviewRepository.delete(id);
    await doctorRepository.updateRating(review.doctor_profile_id);
    return true;
  },
};

module.exports = reviewService;
