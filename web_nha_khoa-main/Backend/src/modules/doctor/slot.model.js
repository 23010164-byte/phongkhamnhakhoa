const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const DoctorSlot = sequelize.define(
  'DoctorSlot',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    doctor_profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'doctor_profiles', key: 'id' },
      onDelete: 'CASCADE',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.STRING(5), // "08:00"
      allowNull: false,
    },
    end_time: {
      type: DataTypes.STRING(5), // "08:30"
      allowNull: false,
    },
    max_patients: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.STRING(20), // "available", "booked"
      defaultValue: 'available',
    },
  },
  {
    tableName: 'doctor_slots',
    indexes: [
      { fields: ['doctor_profile_id', 'date'] },
      { fields: ['doctor_profile_id', 'date', 'start_time'], unique: true },
    ],
  }
);

module.exports = DoctorSlot;
