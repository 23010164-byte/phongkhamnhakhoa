const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { LEAVE_STATUS } = require('../../utils/constants');

const Leave = sequelize.define('Leave', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  doctor_profile_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'doctor_profiles', key: 'id' } },
  leave_date: { type: DataTypes.DATEONLY, allowNull: false },
  reason: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM(...Object.values(LEAVE_STATUS)), defaultValue: LEAVE_STATUS.PENDING },
  rejection_reason: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'doctor_leaves',
  indexes: [
    { fields: ['doctor_profile_id', 'leave_date'], unique: true },
    { fields: ['leave_date'] },
    { fields: ['status'] },
  ],
});

module.exports = Leave;
