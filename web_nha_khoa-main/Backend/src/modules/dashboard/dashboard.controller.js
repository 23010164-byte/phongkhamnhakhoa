const dashboardService = require('./dashboard.service');
const { successResponse } = require('../../utils/response');

const dashboardController = {
  // Route tổng — tự phân theo role
  async getDashboard(req, res, next) {
    try {
      const data = await dashboardService.getDashboard(req.user, req.query);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async getAdminDashboard(req, res, next) {
    try {
      const data = await dashboardService.getAdminDashboard(req.query);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async getDoctorDashboard(req, res, next) {
    try {
      const data = await dashboardService.getDoctorDashboard(req.user.id, req.query);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async getReceptionistDashboard(req, res, next) {
    try {
      const data = await dashboardService.getReceptionistDashboard(req.query);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async getPatientDashboard(req, res, next) {
    try {
      const data = await dashboardService.getPatientDashboard(req.user.id);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },
};

module.exports = dashboardController;
