const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const DoctorProfile = sequelize.define(
  'DoctorProfile',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    specialty_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'specialties', key: 'id' },
      onDelete: 'SET NULL',
    },
    // Học hàm/học vị
    title: {
      type: DataTypes.STRING(50), // "BS.", "ThS.BS.", "PGS.TS.BS."
      allowNull: true,
    },
    // Giới thiệu
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Số năm kinh nghiệm
    experience_years: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    // Học vấn
    education: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Chứng chỉ / bằng cấp
    certificate: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Phí khám
    consultation_fee: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
    },
    // Lịch làm việc
    working_days: {
      type: DataTypes.JSON,
      defaultValue: [],
      // ['monday','tuesday','wednesday','thursday','friday']
    },
    working_start: {
      type: DataTypes.STRING(5), // "08:00"
      defaultValue: '08:00',
    },
    working_end: {
      type: DataTypes.STRING(5), // "17:00"
      defaultValue: '17:00',
    },
    slot_duration_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
    max_patients_per_day: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    // Trạng thái nhận lịch
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Rating
    rating_avg: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
    },
    rating_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'doctor_profiles',
    indexes: [
      { fields: ['user_id'], unique: true },
      { fields: ['specialty_id'] },
      { fields: ['is_available'] },
      { fields: ['rating_avg'] },
    ],
  }
);

module.exports = DoctorProfile;
