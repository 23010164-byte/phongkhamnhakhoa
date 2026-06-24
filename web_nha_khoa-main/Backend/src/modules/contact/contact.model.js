const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

// ========================
// MODEL
// ========================
const Contact = sequelize.define(
  'Contact',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    full_name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false },
    phone: { type: DataTypes.STRING(15), allowNull: true },
    subject: { type: DataTypes.STRING(200), allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM('new', 'in_progress', 'resolved', 'spam'),
      defaultValue: 'new',
    },
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    reply: { type: DataTypes.TEXT, allowNull: true },
    replied_at: { type: DataTypes.DATE, allowNull: true },
    ip_address: { type: DataTypes.STRING(45), allowNull: true },
  },
  {
    tableName: 'contacts',
    indexes: [{ fields: ['status'] }, { fields: ['email'] }],
  }
);

module.exports = Contact;
