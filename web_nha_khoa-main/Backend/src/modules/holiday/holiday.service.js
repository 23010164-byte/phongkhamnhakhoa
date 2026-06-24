const holidayRepository = require('./holiday.repository');
const { AppError } = require('../../middlewares/error.middleware');
const { getPagination } = require('../../utils/helpers');

const holidayService = {
  async create(data) {
    const exists = await holidayRepository.isHoliday(data.holiday_date);
    if (exists) {
      throw new AppError('Ngày nghỉ này đã tồn tại', 400);
    }
    return holidayRepository.create(data);
  },
  async update(id, data) {
    const holiday = await holidayRepository.findById(id);
    if (!holiday) throw new AppError('Không tìm thấy ngày nghỉ', 404);
    if (data.holiday_date && data.holiday_date !== holiday.holiday_date) {
       const exists = await holidayRepository.isHoliday(data.holiday_date);
       if (exists) throw new AppError('Ngày nghỉ mới đã tồn tại', 400);
    }
    return holidayRepository.update(id, data);
  },
  async remove(id) {
    const holiday = await holidayRepository.findById(id);
    if (!holiday) throw new AppError('Không tìm thấy ngày nghỉ', 404);
    return holidayRepository.remove(id);
  },
  async getAll(query) {
    const { page, limit, offset } = getPagination(query);
    const { type, isActive, startDate, endDate } = query;
    const { total, holidays } = await holidayRepository.findAll({
      offset, limit, 
      type: type || undefined,
      isActive: isActive !== undefined && isActive !== '' ? isActive === 'true' : undefined,
      startDate, endDate
    });
    return { total, holidays };
  },
  async getById(id) {
    const holiday = await holidayRepository.findById(id);
    if (!holiday) throw new AppError('Không tìm thấy ngày nghỉ', 404);
    return holiday;
  },
  async isHoliday(date) {
    return holidayRepository.isHoliday(date);
  }
};

module.exports = holidayService;