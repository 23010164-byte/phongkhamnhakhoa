const blogService = require('./blog.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../utils/response');

const blogController = {
  async getAll(req, res, next) {
    try {
      const { blogs, total } = await blogService.getAll(req.query, req.user);
      const { page = 1, limit = 10 } = req.query;
      return paginatedResponse(res, { data: blogs, total, page, limit });
    } catch (error) { next(error); }
  },

  async getBySlug(req, res, next) {
    try {
      const data = await blogService.getBySlug(req.params.slug);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async getById(req, res, next) {
    try {
      const data = await blogService.getById(req.params.id, req.user);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async create(req, res, next) {
    try {
      const data = await blogService.create(req.body, req.user);
      return createdResponse(res, { message: 'Tạo bài viết thành công', data });
    } catch (error) { next(error); }
  },

  async update(req, res, next) {
    try {
      const data = await blogService.update(req.params.id, req.body, req.user);
      return successResponse(res, { message: 'Cập nhật bài viết thành công', data });
    } catch (error) { next(error); }
  },

  async uploadThumbnail(req, res, next) {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'Vui lòng chọn ảnh' });
      const data = await blogService.uploadThumbnail(req.params.id, req.file, req.user);
      return successResponse(res, { message: 'Cập nhật ảnh bìa thành công', data: { thumbnail: data.thumbnail } });
    } catch (error) { next(error); }
  },

  async delete(req, res, next) {
    try {
      await blogService.delete(req.params.id, req.user);
      return successResponse(res, { message: 'Đã xóa bài viết' });
    } catch (error) { next(error); }
  },

  // ========================
  // CATEGORIES
  // ========================
  async getCategories(req, res, next) {
    try {
      const data = await blogService.getCategories();
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async createCategory(req, res, next) {
    try {
      const data = await blogService.createCategory(req.body);
      return createdResponse(res, { message: 'Tạo danh mục thành công', data });
    } catch (error) { next(error); }
  },

  async updateCategory(req, res, next) {
    try {
      const data = await blogService.updateCategory(req.params.id, req.body);
      return successResponse(res, { message: 'Cập nhật danh mục thành công', data });
    } catch (error) { next(error); }
  },

  async deleteCategory(req, res, next) {
    try {
      await blogService.deleteCategory(req.params.id);
      return successResponse(res, { message: 'Đã xóa danh mục' });
    } catch (error) { next(error); }
  },
};

module.exports = blogController;
