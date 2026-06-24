const medicalService = require('./medical.service');
const {
  successResponse,
  createdResponse,
  paginatedResponse,
} = require('../../utils/response');

const medicalController = {
  // Tạo hồ sơ bệnh án
  async create(req, res, next) {
    try {
      const record = await medicalService.create(req.body, req.user);
      return createdResponse(res, { message: 'Tạo hồ sơ bệnh án thành công', data: record });
    } catch (error) { next(error); }
  },

  // Cập nhật hồ sơ bệnh án
  async update(req, res, next) {
    try {
      const record = await medicalService.update(req.params.id, req.body, req.user);
      return successResponse(res, { message: 'Cập nhật hồ sơ bệnh án thành công', data: record });
    } catch (error) { next(error); }
  },

  // Lấy danh sách
  async getAll(req, res, next) {
    try {
      const { records, total } = await medicalService.getAll(req.query, req.user);
      const { page, limit } = req.query;
      return paginatedResponse(res, { data: records, total, page: page || 1, limit: limit || 10 });
    } catch (error) { next(error); }
  },

  // Lấy theo ID
  async getById(req, res, next) {
    try {
      const record = await medicalService.getById(req.params.id, req.user);
      return successResponse(res, { data: record });
    } catch (error) { next(error); }
  },

  // Lấy theo appointment
  async getByAppointment(req, res, next) {
    try {
      const record = await medicalService.getByAppointment(req.params.appointmentId, req.user);
      return successResponse(res, { data: record });
    } catch (error) { next(error); }
  },

  // --- ĐƠN THUỐC ---
  async getPrescription(req, res, next) {
    try {
      const data = await medicalService.getPrescription(req.params.recordId, req.user);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async createPrescription(req, res, next) {
    try {
      const data = await medicalService.savePrescription(req.params.recordId, req.body, req.user);
      return createdResponse(res, { message: 'Kê đƠn thuốc thành công', data });
    } catch (error) { next(error); }
  },

  async updatePrescription(req, res, next) {
    try {
      const data = await medicalService.savePrescription(req.params.recordId, req.body, req.user);
      return successResponse(res, { message: 'Cập nhật đƠn thuốc thành công', data });
    } catch (error) { next(error); }
  },
  async getServices(req, res, next) {
    try {
      const data = await medicalService.getServices(req.params.id, req.user);
      return successResponse(res, { data });
    } catch (error) { next(error); }
  },

  async saveServices(req, res, next) {
    try {
      const data = await medicalService.saveServices(req.params.id, req.body, req.user);
      return successResponse(res, { message: 'Lưu chỉ định dịch vụ thành công', data });
    } catch (error) { next(error); }
  },
};

module.exports = medicalController;
