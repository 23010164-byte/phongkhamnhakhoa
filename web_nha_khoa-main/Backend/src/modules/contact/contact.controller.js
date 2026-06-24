const contactService = require('./contact.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../utils/response');

const contactController = {
  async submit(req, res, next) {
    try {
      const ipAddress = req.headers['x-forwarded-for'] || req.ip;
      const data = await contactService.submit({ ...req.body, ipAddress });
      return createdResponse(res, {
        message: 'Gửi liên hệ thành công! Chúng tôi sẽ phản hồi trong vòng 24 giờ.',
        data: { id: data.id },
      });
    } catch (error) { next(error); }
  },

  async getAll(req, res, next) {
    try {
      const { contacts, total } = await contactService.getAll(req.query);
      const { page = 1, limit = 10 } = req.query;
      return paginatedResponse(res, { data: contacts, total, page, limit });
    } catch (error) { next(error); }
  },

  async getById(req, res, next) {
    try {
      const data = await contactService.getById(req.params.id);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async updateStatus(req, res, next) {
    try {
      const data = await contactService.updateStatus(req.params.id, req.body);
      return successResponse(res, { message: 'Cập nhật trạng thái thành công', data });
    } catch (error) { next(error); }
  },

  async reply(req, res, next) {
    try {
      const data = await contactService.reply(req.params.id, req.body.reply);
      return successResponse(res, { message: 'Đã gửi phản hồi thành công', data });
    } catch (error) { next(error); }
  },

  async delete(req, res, next) {
    try {
      await contactService.delete(req.params.id);
      return successResponse(res, { message: 'Đã xóa liên hệ' });
    } catch (error) { next(error); }
  },
};

module.exports = contactController;
