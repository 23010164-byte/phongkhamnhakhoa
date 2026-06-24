const { Op } = require('sequelize');
const Shift = require('./shift.model');

const shiftRepository = {
  async create(data) {
    return Shift.create(data);
  },
  async findById(id) {
    return Shift.findByPk(id);
  },
  async findAll({ offset, limit, isActive, search }) {
    const where = {};
    if (isActive !== undefined) where.is_active = isActive;
    if (search) where.name = { [Op.like]: `%${search}%` };
    const { count, rows } = await Shift.findAndCountAll({
      where,
      limit,
      offset,
      order: [['start_time', 'ASC']],
    });
    return { total: count, shifts: rows };
  },
  async update(id, data) {
    await Shift.update(data, { where: { id } });
    return this.findById(id);
  },
  async remove(id) {
    return Shift.destroy({ where: { id } });
  },
};

module.exports = shiftRepository;