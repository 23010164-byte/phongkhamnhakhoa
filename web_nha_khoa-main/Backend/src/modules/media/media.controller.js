const { mediaService } = require('./media.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../utils/response');
const { MEDIA_TYPE } = require('../../utils/constants');

const mediaController = {
  async uploadImage(req, res, next) {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'Vui lòng chọn file ảnh' });
      const { refId, refType, type } = req.body;
      const data = await mediaService.uploadImage(req.file, req.user.id, { refId, refType, type });
      return createdResponse(res, { message: 'Tải ảnh lên thành công', data });
    } catch (error) { next(error); }
  },

  async uploadMultiple(req, res, next) {
    try {
      if (!req.files?.length) return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất 1 file' });
      const { refId, refType, type } = req.body;
      const data = await mediaService.uploadMultiple(req.files, req.user.id, { refId, refType, type });
      return createdResponse(res, { message: `Tải lên thành công ${data.length} file`, data });
    } catch (error) { next(error); }
  },

  async uploadMedicalDocument(req, res, next) {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: 'Vui lòng chọn file' });
      const { refId, refType } = req.body;
      const data = await mediaService.uploadMedicalDocument(req.file, req.user.id, { refId, refType });
      return createdResponse(res, { message: 'Tải tài liệu y tế lên thành công', data });
    } catch (error) { next(error); }
  },

  async getMyMedia(req, res, next) {
    try {
      const { media, total } = await mediaService.getMyMedia(req.user.id, req.query);
      const { page = 1, limit = 20 } = req.query;
      return paginatedResponse(res, { data: media, total, page, limit });
    } catch (error) { next(error); }
  },

  async getByRef(req, res, next) {
    try {
      const { refId, refType } = req.query;
      const data = await mediaService.getByRef(refId, refType);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async delete(req, res, next) {
    try {
      await mediaService.delete(req.params.id, req.user);
      return successResponse(res, { message: 'Đã xóa file thành công' });
    } catch (error) { next(error); }
  },
};

module.exports = mediaController;
