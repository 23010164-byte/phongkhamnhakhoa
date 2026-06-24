const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

// ========================
// CẤU HÌNH LƯƠNG (singleton)
// ========================
const SalaryConfig = sequelize.define('SalaryConfig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  // Số tiền một giờ (VND)
  base_hourly_rate: {
    type: DataTypes.DECIMAL(12, 0),
    allowNull: false,
    defaultValue: 210000,
  },
  // Hệ số ca làm việc theo ngày trong tuần
  shift_coefficients: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      monday: 1.0,
      tuesday: 1.0,
      wednesday: 1.0,
      thursday: 1.0,
      friday: 1.0,
      saturday: 1.3,
      sunday: 1.5,
    },
  },
  // Hệ số bác sĩ theo học hàm/học vị
  doctor_coefficients: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      'BS.': 1.2,
      'ThS.': 1.5,
      'TS.': 2.0,
      'PGS.': 2.5,
      'GS.': 3.0,
    },
  },
}, {
  tableName: 'salary_configs',
});

// ========================
// PHIẾU LƯƠNG THÁNG
// ========================
const SalarySlip = sequelize.define('SalarySlip', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  doctor_profile_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'doctor_profiles', key: 'id' },
  },
  // Tháng (1-12)
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Năm
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Tổng số ca đã làm
  total_shifts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // Tổng số giờ làm việc
  total_hours: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  // Tổng tiền lương
  total_amount: {
    type: DataTypes.DECIMAL(15, 0),
    defaultValue: 0,
  },
  // Chi tiết tính lương từng ca (JSON array)
  details: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  // Trạng thái phiếu lương
  status: {
    type: DataTypes.ENUM('draft', 'confirmed'),
    defaultValue: 'draft',
  },
}, {
  tableName: 'salary_slips',
  indexes: [
    { fields: ['doctor_profile_id', 'month', 'year'], unique: true },
    { fields: ['doctor_profile_id'] },
    { fields: ['month', 'year'] },
    { fields: ['status'] },
  ],
});

module.exports = { SalaryConfig, SalarySlip };
