const shiftRepository = require('./shift.repository');
const { AppError } = require('../../middlewares/error.middleware');
const { getPagination } = require('../../utils/helpers');

const shiftService = {
  async create(data) {
    return shiftRepository.create(data);
  },
  async update(id, data) {
    const shift = await shiftRepository.findById(id);
    if (!shift) throw new AppError('Không tìm thấy ca làm việc', 404);
    return shiftRepository.update(id, data);
  },
  async remove(id) {
    const shift = await shiftRepository.findById(id);
    if (!shift) throw new AppError('Không tìm thấy ca làm việc', 404);
    return shiftRepository.remove(id);
  },
  async getAll(query) {
    const { page, limit, offset } = getPagination(query);
    const { isActive, search } = query;
    const { total, shifts } = await shiftRepository.findAll({
      offset, limit,
      isActive: isActive !== undefined && isActive !== '' ? isActive === 'true' : undefined,
      search: search || undefined
    });
    return { total, shifts };
  },
  async getById(id) {
    const shift = await shiftRepository.findById(id);
    if (!shift) throw new AppError('Không tìm thấy ca làm việc', 404);
    return shift;
  }
};

module.exports = shiftService;