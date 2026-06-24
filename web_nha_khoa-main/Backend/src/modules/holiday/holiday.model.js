const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { HOLIDAY_TYPE } = require('../../utils/constants');

const Holiday = sequelize.define('Holiday', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  holiday_date: { type: DataTypes.DATEONLY, allowNull: false, unique: true },
  holiday_type: { type: DataTypes.ENUM(...Object.values(HOLIDAY_TYPE)), allowNull: false, defaultValue: HOLIDAY_TYPE.CLINIC },
  note: { type: DataTypes.TEXT, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'holidays',
  indexes: [
    { fields: ['holiday_date'], unique: true },
    { fields: ['is_active'] },
    { fields: ['holiday_type'] },
  ],
});

module.exports = Holiday;