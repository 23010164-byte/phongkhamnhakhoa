const { Op } = require('sequelize');
const User = require('./user.model');
const { ROLES } = require('../../utils/constants');

const userRepository = {
  async create(data) {
    return User.scope('withSensitive').create(data);
  },

  async findById(id) {
    return User.findByPk(id);
  },

  async findByIdWithPassword(id) {
    return User.scope('withPassword').findByPk(id);
  },

  async findByEmail(email) {
    return User.scope('withSensitive').findOne({ where: { email: email.toLowerCase() } });
  },

  async update(id, data) {
    await User.update(data, { where: { id } });
    return User.findByPk(id);
  },

  async findAll({ page, limit, offset, role, isActive, search }) {
    const where = {};
    if (role) where.role = role;
    if (typeof isActive !== 'undefined') where.is_active = isActive;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return { total: count, users: rows };
  },

  async findPatients({ page, limit, offset, search }) {
    const where = { role: ROLES.PATIENT };
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }
    const { count, rows } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [['full_name', 'ASC']],
    });
    return { total: count, users: rows };
  },

  async toggleActive(id) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return user.update({ is_active: !user.is_active });
  },

  async delete(id) {
    return User.destroy({ where: { id } });
  },

  async countByRole() {
    const results = await User.findAll({
      attributes: ['role', [User.sequelize.fn('COUNT', User.sequelize.col('id')), 'count']],
      group: ['role'],
      raw: true,
    });
    return results.reduce((acc, r) => {
      acc[r.role] = parseInt(r.count);
      return acc;
    }, {});
  },
};

module.exports = userRepository;
