const { specialtyRepository, serviceRepository } = require('./service.repository');
const { AppError } = require('../../middlewares/error.middleware');
const { getPagination, generateSlug } = require('../../utils/helpers');

// ========================
// SPECIALTY SERVICE
// ========================
const specialtyService = {
  async getAll(query) {
    const isActive = query.isActive !== undefined ? query.isActive === 'true' : true;
    return specialtyRepository.findAll(isActive);
  },

  async getById(id) {
    const specialty = await specialtyRepository.findById(id);
    if (!specialty) throw new AppError('Không tìm thấy chuyên khoa', 404);
    return specialty;
  },

  async create(data) {
    const { name, description, icon, image, sortOrder } = data;
    const slug = generateSlug(name);

    const existing = await specialtyRepository.findBySlug(slug);
    if (existing) throw new AppError('Chuyên khoa này đã tồn tại', 409);

    return specialtyRepository.create({ name, slug, description, icon, image, sort_order: sortOrder || 0, is_active: true });
  },

  async update(id, data) {
    const specialty = await specialtyRepository.findById(id);
    if (!specialty) throw new AppError('Không tìm thấy chuyên khoa', 404);

    const { name, description, icon, image, isActive, sortOrder } = data;
    const slug = name ? generateSlug(name) : specialty.slug;

    return specialtyRepository.update(id, { name, slug, description, icon, image, is_active: isActive, sort_order: sortOrder });
  },

  async delete(id) {
    const specialty = await specialtyRepository.findById(id);
    if (!specialty) throw new AppError('Không tìm thấy chuyên khoa', 404);

    const Service = require('./service.model');
    const count = await Service.count({ where: { specialty_id: id } });
    if (count > 0) throw new AppError('Không thể xóa chuyên khoa đang có dịch vụ', 400);

    await specialtyRepository.delete(id);
    return true;
  },
};

// ========================
// SERVICE SERVICE
// ========================
const serviceService = {
  async getAll(query) {
    const { page, limit, offset } = getPagination(query);
    const { specialtyId, search } = query;
    let isActive;
    if (query.isActive === 'all') {
      isActive = undefined;
    } else {
      isActive = query.isActive !== undefined ? query.isActive === 'true' : true;
    }

    return serviceRepository.findAll({ page, limit, offset, specialtyId, isActive, search });
  },

  async getById(id) {
    const service = await serviceRepository.findById(id);
    if (!service) throw new AppError('Không tìm thấy dịch vụ', 404);
    return service;
  },

  async getBySlug(slug) {
    const service = await serviceRepository.findBySlug(slug);
    if (!service) throw new AppError('Không tìm thấy dịch vụ', 404);
    return service;
  },

  async create(data) {
    const { name, specialtyId, description, price, durationMinutes, preparationNote, sortOrder } = data;
    const slug = generateSlug(name);

    const existing = await serviceRepository.findBySlug(slug);
    if (existing) throw new AppError('Dịch vụ này đã tồn tại', 409);

    return serviceRepository.create({
      name, slug,
      specialty_id: specialtyId,
      description,
      price,
      duration_minutes: durationMinutes || 30,
      preparation_note: preparationNote,
      sort_order: sortOrder || 0,
      is_active: true,
    });
  },

  async update(id, data) {
    const service = await serviceRepository.findById(id);
    if (!service) throw new AppError('Không tìm thấy dịch vụ', 404);

    const { name, specialtyId, description, price, durationMinutes, preparationNote, isActive, sortOrder } = data;
    const slug = name ? generateSlug(name) : service.slug;

    return serviceRepository.update(id, {
      name, slug,
      specialty_id: specialtyId,
      description, price,
      duration_minutes: durationMinutes,
      preparation_note: preparationNote,
      is_active: isActive,
      sort_order: sortOrder,
    });
  },

  async delete(id) {
    const service = await serviceRepository.findById(id);
    if (!service) throw new AppError('Không tìm thấy dịch vụ', 404);
    await serviceRepository.delete(id);
    return true;
  },

  async toggleStatus(id) {
    const service = await serviceRepository.findById(id);
    if (!service) throw new AppError('Không tìm thấy dịch vụ', 404);
    
    return serviceRepository.update(id, { is_active: !service.is_active });
  },
};

module.exports = { specialtyService, serviceService };
