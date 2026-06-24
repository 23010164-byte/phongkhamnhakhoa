const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Review = sequelize.define(
  'Review',
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
    rating: {
      type: DataTypes.TINYINT,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Bác sĩ phản hồi
    doctor_reply: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    doctor_replied_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Admin ẩn/hiện review
    is_visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Ẩn danh
    is_anonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'reviews',
    indexes: [
      { fields: ['doctor_profile_id'] },
      { fields: ['patient_id'] },
      { fields: ['appointment_id'], unique: true },
      { fields: ['is_visible'] },
      { fields: ['rating'] },
    ],
  }
);

module.exports = Review;
