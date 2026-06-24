const { Op } = require('sequelize');
const { Blog, BlogCategory } = require('./blog.model');
const User = require('../user/user.model');
const { BLOG_STATUS } = require('../../utils/constants');

const authorAttrs = ['id', 'full_name', 'avatar', 'role'];

const blogRepository = {
  async findAll({ status, categoryId, authorId, search, isFeatured, offset, limit }) {
    const where = {};
    if (status) where.status = status;
    else where.status = BLOG_STATUS.PUBLISHED; // mặc định chỉ lấy published
    if (categoryId) where.category_id = categoryId;
    if (authorId) where.author_id = authorId;
    if (typeof isFeatured !== 'undefined') where.is_featured = isFeatured;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { excerpt: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Blog.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: authorAttrs },
        { model: BlogCategory, as: 'category', attributes: ['id', 'name', 'slug'] },
      ],
      attributes: { exclude: ['content'] }, // Không trả content ở list
      limit,
      offset,
      order: [['published_at', 'DESC'], ['created_at', 'DESC']],
      distinct: true,
    });

    return { total: count, blogs: rows };
  },

  async findById(id) {
    return Blog.findByPk(id, {
      include: [
        { model: User, as: 'author', attributes: authorAttrs },
        { model: BlogCategory, as: 'category' },
      ],
    });
  },

  async findBySlug(slug) {
    return Blog.findOne({
      where: { slug },
      include: [
        { model: User, as: 'author', attributes: authorAttrs },
        { model: BlogCategory, as: 'category' },
      ],
    });
  },

  async create(data) { return Blog.create(data); },

  async update(id, data) {
    await Blog.update(data, { where: { id } });
    return this.findById(id);
  },

  async incrementViewCount(id) {
    return Blog.increment('view_count', { where: { id } });
  },

  async delete(id) { return Blog.destroy({ where: { id } }); },

  async findAllCategories() {
    return BlogCategory.findAll({
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
      include: [{
        model: Blog,
        as: 'blogs',
        where: { status: BLOG_STATUS.PUBLISHED },
        required: false,
        attributes: [],
      }],
      attributes: {
        include: [[Blog.sequelize.fn('COUNT', Blog.sequelize.col('blogs.id')), 'post_count']],
      },
      group: ['BlogCategory.id'],
    });
  },

  async createCategory(data) { return BlogCategory.create(data); },
  async updateCategory(id, data) {
    await BlogCategory.update(data, { where: { id } });
    return BlogCategory.findByPk(id);
  },
  async deleteCategory(id) { return BlogCategory.destroy({ where: { id } }); },
};

module.exports = blogRepository;
