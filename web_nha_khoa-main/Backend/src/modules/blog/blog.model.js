const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');
const { BLOG_STATUS } = require('../../utils/constants');

// Danh mục bài viết
const BlogCategory = sequelize.define(
  'BlogCategory',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'blog_categories',
    indexes: [{ fields: ['slug'], unique: true }],
  }
);

// Bài viết
const Blog = sequelize.define(
  'Blog',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(300),
      allowNull: false,
      unique: true,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'blog_categories', key: 'id' },
      onDelete: 'SET NULL',
    },
    author_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    thumbnail: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    thumbnail_public_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(BLOG_STATUS)),
      defaultValue: BLOG_STATUS.DRAFT,
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // SEO
    meta_title: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    meta_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'blogs',
    indexes: [
      { fields: ['slug'], unique: true },
      { fields: ['status'] },
      { fields: ['author_id'] },
      { fields: ['category_id'] },
      { fields: ['published_at'] },
      { fields: ['is_featured'] },
    ],
  }
);

module.exports = { Blog, BlogCategory };
