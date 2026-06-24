const blogRepository = require('./blog.repository');
const { AppError } = require('../../middlewares/error.middleware');
const { getPagination, generateSlug } = require('../../utils/helpers');
const { ROLES, BLOG_STATUS } = require('../../utils/constants');
const cloudinary = require('../../config/cloudinary');
const logger = require('../../utils/logger');

const blogService = {
  async getAll(query, requestUser) {
    const { page, limit, offset } = getPagination(query);
    const { categoryId, search, isFeatured } = query;
    let { status } = query;

    // Non-admin chỉ xem published
    if (!requestUser || requestUser.role === ROLES.PATIENT) {
      status = BLOG_STATUS.PUBLISHED;
    }

    return blogRepository.findAll({ status, categoryId, search, isFeatured, offset, limit });
  },

  async getBySlug(slug) {
    const blog = await blogRepository.findBySlug(slug);
    if (!blog || blog.status !== BLOG_STATUS.PUBLISHED) {
      throw new AppError('Không tìm thấy bài viết', 404);
    }
    // Tăng view count (non-blocking)
    blogRepository.incrementViewCount(blog.id).catch(() => {});
    return blog;
  },

  async getById(id, requestUser) {
    const blog = await blogRepository.findById(id);
    if (!blog) throw new AppError('Không tìm thấy bài viết', 404);

    // Chỉ admin/tác giả xem được draft
    if (blog.status !== BLOG_STATUS.PUBLISHED) {
      if (!requestUser) throw new AppError('Không tìm thấy bài viết', 404);
      if (requestUser.role !== ROLES.ADMIN && blog.author_id !== requestUser.id) {
        throw new AppError('Không tìm thấy bài viết', 404);
      }
    }

    return blog;
  },

  async create(data, requestUser) {
    const { title, categoryId, excerpt, content, status, metaTitle, metaDescription, tags, isFeatured } = data;

    const baseSlug = generateSlug(title);
    let slug = baseSlug;

    // Tránh trùng slug
    const existing = await blogRepository.findBySlug(slug);
    if (existing) slug = `${baseSlug}-${Date.now()}`;

    const publishedAt = status === BLOG_STATUS.PUBLISHED ? new Date() : null;

    return blogRepository.create({
      title,
      slug,
      category_id: categoryId || null,
      author_id: requestUser.id,
      excerpt,
      content,
      status: status || BLOG_STATUS.DRAFT,
      published_at: publishedAt,
      meta_title: metaTitle || title,
      meta_description: metaDescription || excerpt,
      tags: tags || [],
      is_featured: isFeatured || false,
    });
  },

  async update(id, data, requestUser) {
    const blog = await blogRepository.findById(id);
    if (!blog) throw new AppError('Không tìm thấy bài viết', 404);

    // Chỉ author hoặc admin được sửa
    if (requestUser.role !== ROLES.ADMIN && blog.author_id !== requestUser.id) {
      throw new AppError('Bạn không có quyền sửa bài viết này', 403);
    }

    const { title, categoryId, excerpt, content, status, metaTitle, metaDescription, tags, isFeatured } = data;
    const slug = title ? generateSlug(title) : blog.slug;

    // Nếu chuyển sang published lần đầu
    let publishedAt = blog.published_at;
    if (status === BLOG_STATUS.PUBLISHED && !publishedAt) {
      publishedAt = new Date();
    }

    return blogRepository.update(id, {
      title, slug,
      category_id: categoryId,
      excerpt, content, status,
      published_at: publishedAt,
      meta_title: metaTitle,
      meta_description: metaDescription,
      tags, is_featured: isFeatured,
    });
  },

  async uploadThumbnail(id, file, requestUser) {
    const blog = await blogRepository.findById(id);
    if (!blog) throw new AppError('Không tìm thấy bài viết', 404);
    if (requestUser.role !== ROLES.ADMIN && blog.author_id !== requestUser.id) {
      throw new AppError('Bạn không có quyền sửa bài viết này', 403);
    }

    // Xóa thumbnail cũ
    if (blog.thumbnail_public_id) {
      await cloudinary.uploader.destroy(blog.thumbnail_public_id)
        .catch((e) => logger.warn('Xóa thumbnail cũ thất bại:', e.message));
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'clinic/blogs',
      width: 1200,
      height: 630,
      crop: 'fill',
      quality: 'auto',
      format: 'webp',
    });

    return blogRepository.update(id, {
      thumbnail: result.secure_url,
      thumbnail_public_id: result.public_id,
    });
  },

  async delete(id, requestUser) {
    const blog = await blogRepository.findById(id);
    if (!blog) throw new AppError('Không tìm thấy bài viết', 404);
    if (requestUser.role !== ROLES.ADMIN && blog.author_id !== requestUser.id) {
      throw new AppError('Bạn không có quyền xóa bài viết này', 403);
    }

    if (blog.thumbnail_public_id) {
      await cloudinary.uploader.destroy(blog.thumbnail_public_id).catch(() => {});
    }

    await blogRepository.delete(id);
    return true;
  },

  // Categories
  async getCategories() { return blogRepository.findAllCategories(); },

  async createCategory(data) {
    const { name, description, sortOrder } = data;
    const slug = generateSlug(name);
    return blogRepository.createCategory({ name, slug, description, sort_order: sortOrder || 0 });
  },

  async updateCategory(id, data) {
    const { name, description, sortOrder } = data;
    const slug = name ? generateSlug(name) : undefined;
    return blogRepository.updateCategory(id, { name, slug, description, sort_order: sortOrder });
  },

  async deleteCategory(id) {
    return blogRepository.deleteCategory(id);
  },
};

module.exports = blogService;
