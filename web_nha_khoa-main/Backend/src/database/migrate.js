require('dotenv').config();
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');

// Load tất cả models — Phase 1-5
require('../modules/user/user.model');
require('../modules/auth/auth.model');
require('../modules/doctor/doctor.model');
require('../modules/service/specialty.model');
require('../modules/service/service.model');
require('../modules/appointment/appointment.model');
require('../modules/medical/medical.model');
require('../modules/notification/notification.model');
require('../modules/payment/payment.model');
require('../modules/review/review.model');
require('../modules/media/media.model');
require('../modules/chat/chat.model');
require('../modules/blog/blog.model');
require('../modules/contact/contact.model');
require('../modules/holiday/holiday.model');
require('../modules/shift/shift.model');
require('../modules/roster/roster.model');
require('../modules/salary/salary.model');

// Load associations
const setupAssociations = require('../config/associations');
setupAssociations();

const migrate = async () => {
  try {
    const force = process.argv.includes('--force');
    const alter = process.argv.includes('--alter');

    logger.info('🔄 Bắt đầu migration...');
    logger.info(`   Mode: ${force ? 'FORCE (xóa & tạo lại)' : alter ? 'ALTER (cập nhật schema)' : 'SAFE (chỉ tạo mới)'}`);

    await sequelize.authenticate();
    await sequelize.sync({ force, alter });

    logger.info('✅ Migration hoàn thành!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration thất bại:', error);
    process.exit(1);
  }
};

migrate();
