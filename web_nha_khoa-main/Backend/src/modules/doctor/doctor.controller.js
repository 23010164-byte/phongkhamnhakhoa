const doctorService = require('./doctor.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../utils/response');

const doctorController = {
  async getAllDoctors(req, res, next) {
    try {
      const { doctors, total } = await doctorService.getAllDoctors(req.query);
      const { page = 1, limit = 10 } = req.query;
      return paginatedResponse(res, { data: doctors, total, page, limit });
    } catch (error) { next(error); }
  },

  async getDoctorById(req, res, next) {
    try {
      const doctor = await doctorService.getDoctorById(req.params.id);
      return successResponse(res, { data: doctor });
    } catch (error) { next(error); }
  },

  async getMyProfile(req, res, next) {
    try {
      const doctor = await doctorService.getDoctorByUserId(req.user.id);
      return successResponse(res, { data: doctor });
    } catch (error) { next(error); }
  },

  async createDoctorProfile(req, res, next) {
    try {
      const doctor = await doctorService.createDoctorProfile(req.body);
      return createdResponse(res, { message: 'Tạo hồ sơ bác sĩ thành công', data: doctor });
    } catch (error) { next(error); }
  },

  async updateDoctorProfile(req, res, next) {
    try {
      const doctor = await doctorService.updateDoctorProfile(req.params.id, req.body, req.user);
      return successResponse(res, { message: 'Cập nhật hồ sơ thành công', data: doctor });
    } catch (error) { next(error); }
  },

  async updateMyProfile(req, res, next) {
    try {
      const doctor = await doctorService.updateMyProfile(req.user.id, req.body);
      return successResponse(res, { message: 'Cập nhật hồ sơ thành công', data: doctor });
    } catch (error) { next(error); }
  },

  async toggleAvailability(req, res, next) {
    try {
      const doctor = await doctorService.toggleAvailability(req.params.id);
      return successResponse(res, {
        message: doctor.is_available ? 'Bác sĩ đang nhận bệnh' : 'Bác sĩ tạm ngừng nhận bệnh',
        data: { id: doctor.id, isAvailable: doctor.is_available },
      });
    } catch (error) { next(error); }
  },

  async getAvailableSlots(req, res, next) {
    try {
      const { date } = req.query;
      const slots = await doctorService.getAvailableSlots(req.params.id, date);
      return successResponse(res, { data: slots });
    } catch (error) { next(error); }
  },

  async getDoctorRosters(req, res, next) {
    try {
      const { from, to } = req.query;
      const data = await doctorService.getDoctorRosters(req.params.id, from, to);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async getMySchedule(req, res, next) {
    try {
      const { from, to } = req.query;
      const schedule = await doctorService.getMySchedule(req.user.id, from, to);
      return successResponse(res, { data: schedule });
    } catch (error) { next(error); }
  },

  async upsertSchedule(req, res, next) {
    try {
      const result = await doctorService.upsertSchedule(req.user.id, req.body);
      return successResponse(res, { data: result });
    } catch (error) { next(error); }
  },

  async deleteSlot(req, res, next) {
    try {
      await doctorService.deleteSlot(req.user.id, req.params.slotId);
      return successResponse(res, { message: 'Xoá slot thành công' });
    } catch (error) { next(error); }
  },
};

module.exports = doctorController;
