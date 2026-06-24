const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Shift = sequelize.define('Shift', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  start_time: { type: DataTypes.STRING(5), allowNull: false },
  end_time: { type: DataTypes.STRING(5), allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'shifts',
  indexes: [
    { fields: ['name'], unique: true },
  ],
});

module.exports = Shift;