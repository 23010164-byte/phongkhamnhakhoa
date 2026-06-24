const holidayService = require('./holiday.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../utils/response');

const holidayController = {
  async create(req, res, next) {
    try {
      const data = await holidayService.create(req.body);
      return createdResponse(res, { message: 'Tạo ngày nghỉ thành công', data });
    } catch (error) { next(error); }
  },
  async update(req, res, next) {
    try {
      const data = await holidayService.update(req.params.id, req.body);
      return successResponse(res, { message: 'Cập nhật ngày nghỉ thành công', data });
    } catch (error) { next(error); }
  },
  async remove(req, res, next) {
    try {
      await holidayService.remove(req.params.id);
      return successResponse(res, { message: 'Xóa ngày nghỉ thành công' });
    } catch (error) { next(error); }
  },
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const { total, holidays } = await holidayService.getAll(req.query);
      return paginatedResponse(res, { data: holidays, total, page, limit });
    } catch (error) { next(error); }
  },
  async getById(req, res, next) {
    try {
      const data = await holidayService.getById(req.params.id);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  }
};

module.exports = holidayController;