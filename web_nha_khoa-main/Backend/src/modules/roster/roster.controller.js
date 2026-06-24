const rosterService = require('./roster.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../utils/response');

const rosterController = {
  async create(req, res, next) {
    try {
      const data = await rosterService.create(req.body, req.user);
      return createdResponse(res, { message: 'Đăng ký lịch trực thành công', data });
    } catch (error) { next(error); }
  },
  async approve(req, res, next) {
    try {
      const data = await rosterService.approve(req.params.id);
      return successResponse(res, { message: 'Đã duyệt lịch trực', data });
    } catch (error) { next(error); }
  },
  async reject(req, res, next) {
    try {
      const data = await rosterService.reject(req.params.id);
      return successResponse(res, { message: 'Đã từ chối lịch trực', data });
    } catch (error) { next(error); }
  },
  async remove(req, res, next) {
    try {
      await rosterService.remove(req.params.id);
      return successResponse(res, { message: 'Xóa lịch trực thành công' });
    } catch (error) { next(error); }
  },
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const { total, rosters } = await rosterService.getAll(req.query, req.user);
      return paginatedResponse(res, { data: rosters, total, page, limit });
    } catch (error) { next(error); }
  },
  async getById(req, res, next) {
    try {
      const data = await rosterService.getById(req.params.id, req.user);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },
  async getAvailableDoctors(req, res, next) {
    try {
      const { date, shiftId } = req.query;
      const data = await rosterService.getAvailableDoctors(date, shiftId);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  }
};

module.exports = rosterController;