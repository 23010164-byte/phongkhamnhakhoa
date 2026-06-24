const salaryService = require('./salary.service');
const {
  successResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
  badRequestResponse,
} = require('../../utils/response');

const salaryController = {
  /**
   * Lấy cấu hình lương
   */
  async getConfig(req, res, next) {
    try {
      const config = await salaryService.getConfig();
      return successResponse(res, { message: 'Lấy cấu hình lương thành công', data: config });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cập nhật cấu hình lương
   */
  async updateConfig(req, res, next) {
    try {
      const config = await salaryService.updateConfig(req.body);
      return successResponse(res, { message: 'Cập nhật cấu hình lương thành công', data: config });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Tính lương thử cho một ca (demo)
   */
  async calculateShift(req, res, next) {
    try {
      const result = await salaryService.calculateShift(req.body);
      return successResponse(res, { message: 'Tính lương ca thành công', data: result });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Lấy danh sách lịch hẹn để chỉnh hệ số phức tạp
   */
  async getAppointments(req, res, next) {
    try {
      const data = await salaryService.getAppointments(req.query);
      return successResponse(res, { message: 'Lấy danh sách lịch hẹn thành công', data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Cập nhật hệ số phức tạp cho lịch hẹn
   */
  async updateComplexity(req, res, next) {
    try {
      const { id } = req.params;
      const { complexityLevel } = req.body;
      const data = await salaryService.updateComplexity(id, complexityLevel);
      return successResponse(res, { message: 'Cập nhật hệ số phức tạp thành công', data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Tạo phiếu lương tháng
   */
  async generateSlip(req, res, next) {
    try {
      const { doctorProfileId, month, year } = req.body;
      const data = await salaryService.generateSlip({ doctorProfileId, month, year });
      return createdResponse(res, { message: 'Tạo phiếu lương thành công', data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Báo cáo lương tháng
   */
  async getMonthlyReport(req, res, next) {
    try {
      const { month, year } = req.query;
      const data = await salaryService.getMonthlyReport({ month, year });
      return successResponse(res, { message: 'Lấy báo cáo lương tháng thành công', data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Báo cáo lương năm của một bác sĩ
   */
  async getDoctorYearlyReport(req, res, next) {
    try {
      const { doctorProfileId, year } = req.query;
      const data = await salaryService.getDoctorYearlyReport({ doctorProfileId, year });
      return successResponse(res, { message: 'Lấy báo cáo lương năm thành công', data });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Báo cáo lương năm — tất cả bác sĩ
   */
  async getAllDoctorsYearlyReport(req, res, next) {
    try {
      const { year } = req.query;
      const data = await salaryService.getAllDoctorsYearlyReport({ year });
      return successResponse(res, { message: 'Lấy báo cáo lương năm tổng hợp thành công', data });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = salaryController;
