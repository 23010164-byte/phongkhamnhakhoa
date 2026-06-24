const medicalRepository = require('./medical.repository');
const appointmentRepository = require('../appointment/appointment.repository');
const doctorRepository = require('../doctor/doctor.repository');
const { AppError } = require('../../middlewares/error.middleware');
const { getPagination } = require('../../utils/helpers');
const { ROLES, APPOINTMENT_STATUS, MEDICAL_RECORD_STATUS } = require('../../utils/constants');

const medicalService = {
  // --------------------
  // TẠO HỒ SƠ BỆNH ÁN
  // --------------------
  async create(data, requestUser) {
    const { appointmentId, chiefComplaint, clinicalFindings, diagnosis, icdCode,
      vitals, labOrders, treatmentPlan, notes, followUpDate, prescriptions, complexityLevel } = data;

    // Lấy appointment
    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) throw new AppError('Không tìm thấy lịch hẹn', 404);

    // Chỉ bác sĩ phụ trách mới tạo được
    if (requestUser.role === ROLES.DOCTOR) {
      const myDoctor = await doctorRepository.findByUserId(requestUser.id);
      if (!myDoctor || myDoctor.id !== appointment.doctor_profile_id) {
        throw new AppError('Bạn không phụ trách lịch hẹn này', 403);
      }
    }

    // Kiểm tra đã có hồ sơ chưa
    const existing = await medicalRepository.findByAppointmentId(appointmentId);
    if (existing) throw new AppError('Lịch hẹn này đã có hồ sơ bệnh án', 409);

    const record = await medicalRepository.create({
      appointment_id: appointmentId,
      patient_id: appointment.patient_id,
      doctor_profile_id: appointment.doctor_profile_id,
      chief_complaint: chiefComplaint || null,
      clinical_findings: clinicalFindings || null,
      diagnosis: diagnosis || null,
      icd_code: icdCode || null,
      vitals: vitals || null,
      lab_orders: labOrders || null,
      treatment_plan: treatmentPlan || data.treatment || null,
      notes: notes || null,
      follow_up_date: (followUpDate && followUpDate.trim() !== '') ? followUpDate : null,
      status: data.status || MEDICAL_RECORD_STATUS.DRAFT,
    });

    // Thêm đơn thuốc
    if (prescriptions?.length) {
      await medicalRepository.upsertPrescriptions(record.id, prescriptions);
    }

    // Cập nhật độ khó ca bệnh
    if (complexityLevel !== undefined) {
      await appointmentRepository.update(appointmentId, {
        complexity_level: parseFloat(complexityLevel) || 0
      });
    }

    return medicalRepository.findById(record.id);
  },

  // --------------------
  // CẬP NHẬT
  // --------------------
  async update(id, data, requestUser) {
    const record = await medicalRepository.findById(id);
    if (!record) throw new AppError('Không tìm thấy hồ sơ bệnh án', 404);

    if (record.status === MEDICAL_RECORD_STATUS.COMPLETED && requestUser.role !== ROLES.ADMIN) {
      throw new AppError('Hồ sơ đã hoàn chỉnh, không thể chỉnh sửa', 400);
    }

    if (requestUser.role === ROLES.DOCTOR) {
      const myDoctor = await doctorRepository.findByUserId(requestUser.id);
      if (!myDoctor || myDoctor.id !== record.doctor_profile_id) {
        throw new AppError('Bạn không có quyền chỉnh sửa hồ sơ này', 403);
      }
    }

    const { chiefComplaint, clinicalFindings, diagnosis, icdCode, vitals,
      labOrders, treatmentPlan, notes, followUpDate, status, prescriptions, complexityLevel } = data;

    const updated = await medicalRepository.update(id, {
      chief_complaint: chiefComplaint || null,
      clinical_findings: clinicalFindings || null,
      diagnosis: diagnosis || null,
      icd_code: icdCode || null,
      vitals: vitals || null,
      lab_orders: labOrders || null,
      treatment_plan: treatmentPlan || data.treatment || null,
      notes: notes || null,
      follow_up_date: (followUpDate && followUpDate.trim() !== '') ? followUpDate : null,
      status,
    });

    if (prescriptions !== undefined) {
      await medicalRepository.upsertPrescriptions(id, prescriptions);
    }

    // Cập nhật độ khó ca bệnh
    if (complexityLevel !== undefined) {
      await appointmentRepository.update(record.appointment_id, {
        complexity_level: parseFloat(complexityLevel) || 0
      });
    }

    return medicalRepository.findById(id);
  },

  // --------------------
  // LẤY DANH SÁCH
  // --------------------
  async getAll(query, requestUser) {
    const { page, limit, offset } = getPagination(query);
    const filters = { ...query, page, limit, offset };

    if (requestUser.role === ROLES.PATIENT) {
      filters.patientId = requestUser.id;
    } else if (requestUser.role === ROLES.DOCTOR) {
      const myDoctor = await doctorRepository.findByUserId(requestUser.id);
      if (myDoctor) filters.doctorProfileId = myDoctor.id;
    }

    return medicalRepository.findAll(filters);
  },

  async getById(id, requestUser) {
    const record = await medicalRepository.findById(id);
    if (!record) throw new AppError('Không tìm thấy hồ sơ bệnh án', 404);

    if (requestUser.role === ROLES.PATIENT && record.patient_id !== requestUser.id) {
      throw new AppError('Bạn không có quyền xem hồ sơ này', 403);
    }
    if (requestUser.role === ROLES.DOCTOR) {
      const myDoctor = await doctorRepository.findByUserId(requestUser.id);
      if (!myDoctor || myDoctor.id !== record.doctor_profile_id) {
        throw new AppError('Bạn không có quyền xem hồ sơ này', 403);
      }
    }

    return record;
  },

  async getByAppointment(appointmentId, requestUser) {
    const record = await medicalRepository.findByAppointmentId(appointmentId);
    if (!record) throw new AppError('Chưa có hồ sơ bệnh án cho lịch hẹn này', 404);
    return this.getById(record.id, requestUser);
  },

  // --------------------
  // ĐƠN THUỐC
  // --------------------
  async getPrescription(recordId, requestUser) {
    const record = await medicalRepository.findById(recordId);
    if (!record) throw new AppError('Không tìm thấy hồ sơ bệnh án', 404);

    if (requestUser.role === ROLES.PATIENT && record.patient_id !== requestUser.id) {
      throw new AppError('Bạn không có quyền xem hồ sơ này', 403);
    }

    const items = record.prescriptions || [];
    if (items.length === 0) throw new AppError('Chưa có đơn thuốc', 404);

    return {
      id: record.id,
      medical_record_id: record.id,
      items,
      notes: record.notes,
      updated_at: record.updated_at,
      created_at: record.created_at,
    };
  },

  async savePrescription(recordId, data, requestUser) {
    const record = await medicalRepository.findById(recordId);
    if (!record) throw new AppError('Không tìm thấy hồ sơ bệnh án', 404);

    if (requestUser.role === ROLES.DOCTOR) {
      const myDoctor = await doctorRepository.findByUserId(requestUser.id);
      if (!myDoctor || myDoctor.id !== record.doctor_profile_id) {
        throw new AppError('Bạn không có quyền kê đơn cho hồ sơ này', 403);
      }
    } else if (requestUser.role !== ROLES.ADMIN) {
      throw new AppError('Chỉ bác sĩ hoặc admin mới được kê đơn thuốc', 403);
    }

    const { items = [], notes } = data;

    const prescriptionRows = items.map((item, i) => ({
      medicine_name: item.medicine_name || item.medicineName || '',
      dosage: item.dosage || null,
      frequency: item.frequency || null,
      duration: item.duration || null,
      quantity: item.quantity != null ? String(item.quantity) : null,
      unit: item.unit || 'viên',
      instructions: item.instruction || item.instructions || null,
      sort_order: i,
    }));

    await medicalRepository.upsertPrescriptions(recordId, prescriptionRows);

    // Lưu ghi chú vào notes của bệnh án nếu có
    if (notes !== undefined) {
      await medicalRepository.update(recordId, { notes });
    }

    const updated = await medicalRepository.findById(recordId);
    return {
      id: updated.id,
      medical_record_id: updated.id,
      items: updated.prescriptions || [],
      notes: updated.notes,
      updated_at: updated.updated_at,
      created_at: updated.created_at,
    };
  },

  // --------------------
  // DỊCH VỤ ĐIỀU TRỊ
  // --------------------
  async getServices(recordId, requestUser) {
    const record = await medicalRepository.findById(recordId);
    if (!record) throw new AppError('Không tìm thấy hồ sơ bệnh án', 404);

    if (requestUser.role === ROLES.PATIENT && record.patient_id !== requestUser.id) {
      throw new AppError('Bạn không có quyền xem hồ sơ này', 403);
    }

    const items = record.services || [];
    
    return {
      id: record.id,
      medical_record_id: record.id,
      items,
    };
  },

  async saveServices(recordId, data, requestUser) {
    const record = await medicalRepository.findById(recordId);
    if (!record) throw new AppError('Không tìm thấy hồ sơ bệnh án', 404);

    if (requestUser.role === ROLES.DOCTOR) {
      const myDoctor = await doctorRepository.findByUserId(requestUser.id);
      if (!myDoctor || myDoctor.id !== record.doctor_profile_id) {
        throw new AppError('Bạn không có quyền chỉ định dịch vụ cho hồ sơ này', 403);
      }
    } else if (requestUser.role !== ROLES.ADMIN) {
      throw new AppError('Chỉ bác sĩ hoặc admin mới được chỉ định dịch vụ', 403);
    }

    const { items = [] } = data;

    const serviceRows = items.map((item) => ({
      service_id: item.service_id || item.serviceId,
      price: item.price || 0,
      quantity: item.quantity || 1,
      notes: item.notes || null,
    }));

    await medicalRepository.upsertServices(recordId, serviceRows);

    const updated = await medicalRepository.findById(recordId);
    return {
      id: updated.id,
      medical_record_id: updated.id,
      items: updated.services || [],
    };
  },
};

module.exports = medicalService;
