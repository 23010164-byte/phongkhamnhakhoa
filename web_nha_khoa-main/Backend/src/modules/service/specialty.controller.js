const { specialtyService } = require('./service.service');
const { successResponse, createdResponse } = require('../../utils/response');

const specialtyController = {
  async getAll(req, res, next) {
    try {
      const data = await specialtyService.getAll(req.query);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async getById(req, res, next) {
    try {
      const data = await specialtyService.getById(req.params.id);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async create(req, res, next) {
    try {
      const data = await specialtyService.create(req.body);
      return createdResponse(res, { message: 'Tạo chuyên khoa thành công', data });
    } catch (error) { next(error); }
  },

  async update(req, res, next) {
    try {
      const data = await specialtyService.update(req.params.id, req.body);
      return successResponse(res, { message: 'Cập nhật chuyên khoa thành công', data });
    } catch (error) { next(error); }
  },

  async delete(req, res, next) {
    try {
      await specialtyService.delete(req.params.id);
      return successResponse(res, { message: 'Đã xóa chuyên khoa' });
    } catch (error) { next(error); }
  },
};

module.exports = specialtyController;
