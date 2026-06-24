const shiftService = require('./shift.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../utils/response');

const shiftController = {
  async create(req, res, next) {
    try {
      const data = await shiftService.create(req.body);
      return createdResponse(res, { message: 'Tạo ca làm việc thành công', data });
    } catch (error) { next(error); }
  },
  async update(req, res, next) {
    try {
      const data = await shiftService.update(req.params.id, req.body);
      return successResponse(res, { message: 'Cập nhật ca làm việc thành công', data });
    } catch (error) { next(error); }
  },
  async remove(req, res, next) {
    try {
      await shiftService.remove(req.params.id);
      return successResponse(res, { message: 'Xóa ca làm việc thành công' });
    } catch (error) { next(error); }
  },
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const { total, shifts } = await shiftService.getAll(req.query);
      return paginatedResponse(res, { data: shifts, total, page, limit });
    } catch (error) { next(error); }
  },
  async getById(req, res, next) {
    try {
      const data = await shiftService.getById(req.params.id);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  }
};

module.exports = shiftController;