const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { APPOINTMENT_STATUS, PAYMENT_STATUS } = require('../../utils/constants');

const Appointment = sequelize.define(
  'Appointment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    booking_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
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
    service_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'services', key: 'id' },
    },
    appointment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    appointment_time: {
      type: DataTypes.STRING(5), // "09:00"
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(APPOINTMENT_STATUS)),
      defaultValue: APPOINTMENT_STATUS.PENDING,
    },
    // Lý do khám
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Ghi chú của bác sĩ / lễ tân
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Lý do hủy
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancelled_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Check-in
    checked_in_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Hoàn thành
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Thanh toán
    payment_status: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)),
      defaultValue: PAYMENT_STATUS.PENDING,
    },
    // Số thứ tự trong ngày
    queue_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Hệ số phức tạp của ca bệnh (dùng cho tính lương)
    complexity_level: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
      validate: { min: 0, max: 0.5 },
    },
    // Nhắc nhở đã gửi chưa
    reminder_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'appointments',
    indexes: [
      { fields: ['patient_id'] },
      { fields: ['doctor_profile_id'] },
      { fields: ['appointment_date'] },
      { fields: ['status'] },
      { fields: ['booking_code'], unique: true },
      { fields: ['doctor_profile_id', 'appointment_date', 'appointment_time'], unique: true },
    ],
  }
);

module.exports = Appointment;
