const reviewService = require('./review.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../utils/response');

const reviewController = {
  async getAll(req, res, next) {
    try {
      const { reviews, total } = await reviewService.getAll(req.query, req.user);
      const { page = 1, limit = 10 } = req.query;
      return paginatedResponse(res, { data: reviews, total, page, limit });
    } catch (error) { next(error); }
  },

  async getById(req, res, next) {
    try {
      const data = await reviewService.getById(req.params.id);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async getDoctorRatingSummary(req, res, next) {
    try {
      const data = await reviewService.getDoctorRatingSummary(req.params.doctorProfileId);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async create(req, res, next) {
    try {
      const data = await reviewService.create(req.body, req.user);
      return createdResponse(res, { message: 'Đánh giá thành công', data });
    } catch (error) { next(error); }
  },

  async update(req, res, next) {
    try {
      const data = await reviewService.update(req.params.id, req.body, req.user);
      return successResponse(res, { message: 'Cập nhật đánh giá thành công', data });
    } catch (error) { next(error); }
  },

  async reply(req, res, next) {
    try {
      const data = await reviewService.reply(req.params.id, req.body.reply, req.user);
      return successResponse(res, { message: 'Phản hồi đánh giá thành công', data });
    } catch (error) { next(error); }
  },

  async toggleVisibility(req, res, next) {
    try {
      const data = await reviewService.toggleVisibility(req.params.id);
      return successResponse(res, {
        message: data.is_visible ? 'Đã hiện đánh giá' : 'Đã ẩn đánh giá',
        data,
      });
    } catch (error) { next(error); }
  },

  async delete(req, res, next) {
    try {
      await reviewService.delete(req.params.id, req.user);
      return successResponse(res, { message: 'Đã xóa đánh giá' });
    } catch (error) { next(error); }
  },
};

module.exports = reviewController;
