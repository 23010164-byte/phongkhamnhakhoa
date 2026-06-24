const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { ROSTER_STATUS } = require('../../utils/constants');

const Roster = sequelize.define('Roster', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  doctor_profile_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'doctor_profiles', key: 'id' } },
  shift_id: { type: DataTypes.UUID, allowNull: false, references: { model: 'shifts', key: 'id' } },
  roster_date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM(...Object.values(ROSTER_STATUS)), defaultValue: ROSTER_STATUS.PENDING },
  note: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'rosters',
  indexes: [
    { fields: ['doctor_profile_id', 'shift_id', 'roster_date'], unique: true },
    { fields: ['roster_date'] },
    { fields: ['doctor_profile_id'] },
    { fields: ['status'] },
  ],
});

module.exports = Roster;