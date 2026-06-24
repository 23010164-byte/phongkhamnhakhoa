const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { MEDIA_TYPE } = require('../../utils/constants');

const Media = sequelize.define(
  'Media',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    // Reference tới entity liên quan (appointment, medical_record, blog...)
    ref_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    ref_type: {
      type: DataTypes.STRING(50), // 'appointment', 'medical_record', 'blog', 'avatar'
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(MEDIA_TYPE)),
      defaultValue: MEDIA_TYPE.DOCUMENT,
    },
    original_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    public_id: {
      type: DataTypes.STRING(255),
      allowNull: true, // Cloudinary public_id
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    size: {
      type: DataTypes.INTEGER, // bytes
      allowNull: true,
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'media',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['ref_id', 'ref_type'] },
      { fields: ['type'] },
    ],
  }
);

module.exports = Media;
