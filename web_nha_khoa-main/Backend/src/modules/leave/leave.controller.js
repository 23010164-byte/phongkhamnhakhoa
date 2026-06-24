const leaveService = require('./leave.service');
const { successResponse, createdResponse } = require('../../utils/response');

class LeaveController {
  async create(req, res, next) {
    try {
      const leave = await leaveService.createLeave(req.user.id, req.body);
      return createdResponse(res, { message: 'Gửi yêu cầu xin nghỉ thành công', data: leave });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const leaves = await leaveService.getLeavesByUser(req.user.id, req.user.role);
      return successResponse(res, { data: leaves });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, rejection_reason } = req.body;
      const updatedLeave = await leaveService.updateLeaveStatus(id, status, rejection_reason);
      return successResponse(res, { message: 'Cập nhật trạng thái thành công', data: updatedLeave });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LeaveController();
