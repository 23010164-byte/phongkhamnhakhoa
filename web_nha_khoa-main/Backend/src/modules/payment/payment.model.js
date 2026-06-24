const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { PAYMENT_STATUS, PAYMENT_METHOD } = require('../../utils/constants');

const Payment = sequelize.define(
  'Payment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    appointment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'appointments', key: 'id' },
    },
    medical_record_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'medical_records', key: 'id' },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    transaction_code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 0),
      allowNull: false,
    },
    method: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_METHOD)),
      allowNull: false,
      defaultValue: PAYMENT_METHOD.CASH,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PAYMENT_STATUS)),
      defaultValue: PAYMENT_STATUS.PENDING,
    },
    // VNPay / MoMo response data
    gateway_data: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    // URL redirect sau thanh toán online
    payment_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // Refund
    refunded_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    refund_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'payments',
    indexes: [
      { fields: ['appointment_id'] },
      { fields: ['user_id'] },
      { fields: ['transaction_code'], unique: true },
      { fields: ['status'] },
    ],
  }
);

module.exports = Payment;
