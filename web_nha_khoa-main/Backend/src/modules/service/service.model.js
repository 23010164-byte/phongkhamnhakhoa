const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Service = sequelize.define(
  'Service',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    specialty_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'specialties', key: 'id' },
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(12, 0),
      allowNull: false,
      defaultValue: 0,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    },
    preparation_note: {
      type: DataTypes.TEXT, // Hướng dẫn chuẩn bị trước khám
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'services',
    indexes: [
      { fields: ['slug'], unique: true },
      { fields: ['specialty_id'] },
      { fields: ['is_active'] },
    ],
  }
);

module.exports = Service;
