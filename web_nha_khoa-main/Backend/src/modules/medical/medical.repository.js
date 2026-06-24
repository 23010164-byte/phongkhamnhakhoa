const { MedicalRecord, Prescription, MedicalRecordService } = require('./medical.model');
const Service = require('../service/service.model');
const User = require('../user/user.model');
const DoctorProfile = require('../doctor/doctor.model');
const Appointment = require('../appointment/appointment.model');
const { Op } = require('sequelize');
const { sequelize } = require('../../config/database');

const patientAttrs = ['id', 'full_name', 'email', 'phone', 'date_of_birth', 'gender', 'blood_type', 'allergies'];
const doctorUserAttrs = ['id', 'full_name', 'avatar'];

const defaultIncludes = [
  { model: User, as: 'patient', attributes: patientAttrs },
  {
    model: DoctorProfile,
    as: 'doctor',
    include: [{ model: User, as: 'user', attributes: doctorUserAttrs }],
    attributes: ['id', 'title'],
  },
  {
    model: Appointment,
    as: 'appointment',
    include: [
      {
        model: DoctorProfile,
        as: 'doctor',
        attributes: ['id', 'title', 'consultation_fee'],
      },
      {
        model: require('../service/service.model'),
        as: 'service',
        attributes: ['id', 'name', 'price'],
      }
    ],
    attributes: ['id', 'booking_code', 'appointment_date', 'appointment_time'],
  },
  { model: Prescription, as: 'prescriptions', separate: true, order: [['sort_order', 'ASC']] },
  {
    model: MedicalRecordService,
    as: 'services',
    include: [{ model: Service, as: 'service', attributes: ['name', 'price'] }],
    attributes: ['id', 'price', 'quantity', 'notes', 'created_at'],
    separate: true,
  },
];

const medicalRepository = {
  async create(data) { return MedicalRecord.create(data); },

  async findById(id) {
    return MedicalRecord.findByPk(id, { include: defaultIncludes });
  },

  async findByAppointmentId(appointmentId) {
    return MedicalRecord.findOne({ where: { appointment_id: appointmentId }, include: defaultIncludes });
  },

  async findAll({ offset, limit, patientId, doctorProfileId, startDate, endDate, status, search }) {
    const where = {};
    if (patientId) where.patient_id = patientId;
    if (doctorProfileId) where.doctor_profile_id = doctorProfileId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at[Op.gte] = startDate;
      if (endDate) where.created_at[Op.lte] = endDate;
    }

    const include = defaultIncludes.map((inc) => {
      if (inc.as === 'patient' && search) {
        return {
          ...inc,
          where: {
            full_name: { [Op.like]: `%${search}%` },
          },
          required: true, // INNER JOIN to filter records by patient name
        };
      }
      return inc;
    });

    const { count, rows } = await MedicalRecord.findAndCountAll({
      where,
      include,
      limit, offset,
      order: [['created_at', 'DESC']],
      distinct: true,
    });
    return { total: count, records: rows };
  },

  async update(id, data) {
    await MedicalRecord.update(data, { where: { id } });
    return this.findById(id);
  },

  async upsertPrescriptions(medicalRecordId, prescriptions) {
    // Xóa cũ, thêm mới
    await Prescription.destroy({ where: { medical_record_id: medicalRecordId } });
    if (!prescriptions?.length) return [];
    return Prescription.bulkCreate(
      prescriptions.map((p, i) => ({ ...p, medical_record_id: medicalRecordId, sort_order: i }))
    );
  },

  async upsertServices(medicalRecordId, services) {
    // Xóa cũ, thêm mới
    await MedicalRecordService.destroy({ where: { medical_record_id: medicalRecordId } });
    if (!services?.length) return [];
    return MedicalRecordService.bulkCreate(
      services.map(s => ({ ...s, medical_record_id: medicalRecordId }))
    );
  },
};

module.exports = medicalRepository;
