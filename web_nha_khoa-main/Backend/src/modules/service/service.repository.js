const Specialty = require('./specialty.model');
const Service = require('./service.model');
const { Op } = require('sequelize');

const specialtyRepository = {
  async findAll(isActive) {
    const where = {};
    if (typeof isActive !== 'undefined') where.is_active = isActive;
    return Specialty.findAll({
      where,
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
      include: [{ model: Service, as: 'services', where: { is_active: true }, required: false, attributes: ['id', 'name', 'price'] }],
    });
  },

  async findById(id) {
    return Specialty.findByPk(id, {
      include: [{ model: Service, as: 'services', where: { is_active: true }, required: false }],
    });
  },

  async findBySlug(slug) {
    return Specialty.findOne({ where: { slug } });
  },

  async create(data) { return Specialty.create(data); },

  async update(id, data) {
    await Specialty.update(data, { where: { id } });
    return this.findById(id);
  },

  async delete(id) { return Specialty.destroy({ where: { id } }); },
};

const serviceRepository = {
  async findAll({ offset, limit, specialtyId, isActive, search }) {
    const where = {};
    if (specialtyId) where.specialty_id = specialtyId;
    if (typeof isActive !== 'undefined') where.is_active = isActive;
    if (search) where.name = { [Op.like]: `%${search}%` };

    const { count, rows } = await Service.findAndCountAll({
      where,
      include: [{ model: Specialty, as: 'specialty', attributes: ['id', 'name', 'icon'] }],
      limit,
      offset,
      order: [['sort_order', 'ASC'], ['name', 'ASC']],
    });
    return { total: count, services: rows };
  },

  async findById(id) {
    return Service.findByPk(id, {
      include: [{ model: Specialty, as: 'specialty' }],
    });
  },

  async findBySlug(slug) {
    return Service.findOne({
      where: { slug },
      include: [{ model: Specialty, as: 'specialty' }],
    });
  },

  async create(data) { return Service.create(data); },

  async update(id, data) {
    await Service.update(data, { where: { id } });
    return this.findById(id);
  },

  async delete(id) { return Service.destroy({ where: { id } }); },
};

module.exports = { specialtyRepository, serviceRepository };
