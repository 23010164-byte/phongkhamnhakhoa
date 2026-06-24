const userService = require('./user.service');
const {
  successResponse,
  createdResponse,
  paginatedResponse,
  notFoundResponse,
} = require('../../utils/response');

const userController = {
  // --- Profile (own) ---
  async getProfile(req, res, next) {
    try {
      const user = await userService.getProfile(req.user.id);
      return successResponse(res, { data: user });
    } catch (error) { next(error); }
  },

  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateProfile(req.user.id, req.body);
      return successResponse(res, { message: 'Cập nhật thông tin thành công', data: user });
    } catch (error) { next(error); }
  },

  async updateAvatar(req, res, next) {
    try {
      if (!req.file) return notFoundResponse(res, 'Vui lòng chọn ảnh');
      const user = await userService.updateAvatar(req.user.id, req.file);
      return successResponse(res, { message: 'Cập nhật ảnh đại diện thành công', data: { avatar: user.avatar } });
    } catch (error) { next(error); }
  },

  // --- Admin: CRUD users ---
  async getAllUsers(req, res, next) {
    try {
      const { users, total } = await userService.getAllUsers(req.query);
      const { page, limit } = req.query;
      return paginatedResponse(res, { data: users, total, page: page || 1, limit: limit || 10 });
    } catch (error) { next(error); }
  },

  async getPatients(req, res, next) {
    try {
      const { users, total } = await userService.getPatients(req.query);
      const { page, limit } = req.query;
      return paginatedResponse(res, { data: users, total, page: page || 1, limit: limit || 10 });
    } catch (error) { next(error); }
  },

  async createUser(req, res, next) {
    try {
      const user = await userService.createUser(req.body, req.user.role);
      return createdResponse(res, { message: 'Tạo tài khoản thành công', data: user });
    } catch (error) { next(error); }
  },

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return successResponse(res, { data: user });
    } catch (error) { next(error); }
  },

  async updateUser(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      return successResponse(res, { message: 'Cập nhật thành công', data: user });
    } catch (error) { next(error); }
  },

  async toggleUserActive(req, res, next) {
    try {
      const user = await userService.toggleUserActive(req.params.id);
      return successResponse(res, {
        message: user.is_active ? 'Đã kích hoạt tài khoản' : 'Đã vô hiệu hóa tài khoản',
        data: { id: user.id, isActive: user.is_active },
      });
    } catch (error) { next(error); }
  },

  async deleteUser(req, res, next) {
    try {
      await userService.deleteUser(req.params.id);
      return successResponse(res, { message: 'Đã xóa tài khoản thành công' });
    } catch (error) { next(error); }
  },
};

module.exports = userController;
