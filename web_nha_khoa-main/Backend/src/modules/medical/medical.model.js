const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { MEDICAL_RECORD_STATUS } = require('../../utils/constants');

// Hồ sơ bệnh án
const MedicalRecord = sequelize.define(
  'MedicalRecord',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    appointment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'appointments', key: 'id' },
    },
    patient_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    doctor_profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'doctor_profiles', key: 'id' },
    },
    // Triệu chứng
    chief_complaint: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Khám lâm sàng
    clinical_findings: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Chẩn đoán
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Mã ICD-10
    icd_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    // Kết quả xét nghiệm / chỉ số
    vitals: {
      type: DataTypes.JSON,
      // { weight, height, blood_pressure, heart_rate, temperature, spo2 }
      allowNull: true,
    },
    // Chỉ định xét nghiệm / chẩn đoán hình ảnh
    lab_orders: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Kế hoạch điều trị
    treatment_plan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Ghi chú bổ sung
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Lịch tái khám
    follow_up_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MEDICAL_RECORD_STATUS)),
      defaultValue: MEDICAL_RECORD_STATUS.DRAFT,
    },
  },
  {
    tableName: 'medical_records',
    indexes: [
      { fields: ['patient_id'] },
      { fields: ['doctor_profile_id'] },
      { fields: ['appointment_id'], unique: true },
    ],
  }
);

// Đơn thuốc (kết hợp trong medical record)
const Prescription = sequelize.define(
  'Prescription',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    medical_record_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'medical_records', key: 'id' },
      onDelete: 'CASCADE',
    },
    medicine_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    dosage: {
      type: DataTypes.STRING(100), // "500mg"
      allowNull: true,
    },
    frequency: {
      type: DataTypes.STRING(100), // "Ngày 3 lần sau ăn"
      allowNull: true,
    },
    duration: {
      type: DataTypes.STRING(100), // "7 ngày"
      allowNull: true,
    },
    quantity: {
      type: DataTypes.STRING(50), // "21"
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(30), // "viên", "gói", "ống"
      defaultValue: 'viên',
    },
    instructions: {
      type: DataTypes.TEXT, // Hướng dẫn sử dụng
      allowNull: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'prescriptions',
    indexes: [{ fields: ['medical_record_id'] }],
  }
);

// Dịch vụ thực hiện trong lần khám
const MedicalRecordService = sequelize.define(
  'MedicalRecordService',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    medical_record_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'medical_records', key: 'id' },
      onDelete: 'CASCADE',
    },
    service_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'services', key: 'id' },
    },
    price: {
      type: DataTypes.DECIMAL(12, 0),
      allowNull: false,
      defaultValue: 0,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  },
  {
    tableName: 'medical_record_services',
    indexes: [
      { fields: ['medical_record_id'] },
      { fields: ['service_id'] },
    ],
  }
);

module.exports = { MedicalRecord, Prescription, MedicalRecordService };
