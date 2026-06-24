const appointmentService = require('./appointment.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../utils/response');

const appointmentController = {
  async book(req, res, next) {
    try {
      const data = await appointmentService.book(req.body, req.user);
      return createdResponse(res, {
        message: `Đặt lịch thành công! Mã đặt lịch: ${data.booking_code}`,
        data,
      });
    } catch (error) { next(error); }
  },

  async getAll(req, res, next) {
    try {
      const { appointments, total } = await appointmentService.getAll(req.query, req.user);
      const { page = 1, limit = 10 } = req.query;
      return paginatedResponse(res, { data: appointments, total, page, limit });
    } catch (error) { next(error); }
  },

  async getById(req, res, next) {
    try {
      const data = await appointmentService.getById(req.params.id, req.user);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async getByBookingCode(req, res, next) {
    try {
      const data = await appointmentService.getByBookingCode(req.params.code);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async confirm(req, res, next) {
    try {
      const data = await appointmentService.confirm(req.params.id, req.body.notes);
      return successResponse(res, { message: 'Đã xác nhận lịch hẹn', data });
    } catch (error) { next(error); }
  },

  async checkIn(req, res, next) {
    try {
      const data = await appointmentService.checkIn(req.params.id);
      return successResponse(res, { message: 'Check-in thành công', data });
    } catch (error) { next(error); }
  },

  async complete(req, res, next) {
    try {
      const data = await appointmentService.complete(req.params.id, req.body.notes);
      return successResponse(res, { message: 'Đã hoàn thành lịch khám', data });
    } catch (error) { next(error); }
  },

  async cancel(req, res, next) {
    try {
      const data = await appointmentService.cancel(req.params.id, {
        reason: req.body.reason,
        cancelledBy: req.user.id,
      });
      return successResponse(res, { message: 'Đã hủy lịch hẹn', data });
    } catch (error) { next(error); }
  },

  async markNoShow(req, res, next) {
    try {
      const data = await appointmentService.markNoShow(req.params.id);
      return successResponse(res, { message: 'Đã đánh dấu không đến', data });
    } catch (error) { next(error); }
  },
};

module.exports = appointmentController;
