const { serviceService } = require('./service.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../utils/response');

const serviceController = {
  async getAll(req, res, next) {
    try {
      const { services, total } = await serviceService.getAll(req.query);
      const { page = 1, limit = 10 } = req.query;
      return paginatedResponse(res, { data: services, total, page, limit });
    } catch (error) { next(error); }
  },

  async getById(req, res, next) {
    try {
      const data = await serviceService.getById(req.params.id);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async getBySlug(req, res, next) {
    try {
      const data = await serviceService.getBySlug(req.params.slug);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async create(req, res, next) {
    try {
      const data = await serviceService.create(req.body);
      return createdResponse(res, { message: 'Tạo dịch vụ thành công', data });
    } catch (error) { next(error); }
  },

  async update(req, res, next) {
    try {
      const data = await serviceService.update(req.params.id, req.body);
      return successResponse(res, { message: 'Cập nhật dịch vụ thành công', data });
    } catch (error) { next(error); }
  },

  async delete(req, res, next) {
    try {
      await serviceService.delete(req.params.id);
      return successResponse(res, { message: 'Đã xóa dịch vụ' });
    } catch (error) { next(error); }
  },

  async toggleStatus(req, res, next) {
    try {
      const data = await serviceService.toggleStatus(req.params.id);
      return successResponse(res, { message: 'Đã thay đổi trạng thái dịch vụ', data });
    } catch (error) { next(error); }
  },
};

module.exports = serviceController;
