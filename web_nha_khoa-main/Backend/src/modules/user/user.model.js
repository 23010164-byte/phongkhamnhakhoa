const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { ROLES, GENDER } = require('../../utils/constants');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { len: [2, 100] },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      unique: true,
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(ROLES)),
      allowNull: false,
      defaultValue: ROLES.PATIENT,
    },
    gender: {
      type: DataTypes.ENUM(...Object.values(GENDER)),
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatar_public_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email_verify_token: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    email_verify_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    password_reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Thông tin bổ sung cho bệnh nhân
    blood_type: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    allergies: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    emergency_contact_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    emergency_contact_phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    indexes: [
      { fields: ['email'], unique: true },
      { fields: ['phone'] },
      { fields: ['role'] },
      { fields: ['is_active'] },
    ],
    defaultScope: {
      attributes: { exclude: ['password_hash', 'email_verify_token', 'email_verify_expires', 'password_reset_token', 'password_reset_expires'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password_hash'] },
      },
      withSensitive: {
        attributes: {},
      },
    },
  }
);

module.exports = User;
