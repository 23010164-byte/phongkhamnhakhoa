const { Op } = require('sequelize');
const Holiday = require('./holiday.model');

const holidayRepository = {
  async create(data) {
    return Holiday.create(data);
  },
  async findById(id) {
    return Holiday.findByPk(id);
  },
  async findAll({ offset, limit, type, isActive, startDate, endDate }) {
    const where = {};
    if (type) where.holiday_type = type;
    if (isActive !== undefined) where.is_active = isActive;
    if (startDate || endDate) {
      where.holiday_date = {};
      if (startDate) where.holiday_date[Op.gte] = startDate;
      if (endDate) where.holiday_date[Op.lte] = endDate;
    }
    const { count, rows } = await Holiday.findAndCountAll({
      where,
      limit,
      offset,
      order: [['holiday_date', 'DESC']],
    });
    return { total: count, holidays: rows };
  },
  async update(id, data) {
    await Holiday.update(data, { where: { id } });
    return this.findById(id);
  },
  async remove(id) {
    return Holiday.destroy({ where: { id } });
  },
  async isHoliday(date) {
    const count = await Holiday.count({
      where: {
        holiday_date: date,
        is_active: true,
      },
    });
    return count > 0;
  },
  async findActiveByDateRange(startDate, endDate) {
    return Holiday.findAll({
      where: {
        is_active: true,
        holiday_date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });
  },
};

module.exports = holidayRepository;