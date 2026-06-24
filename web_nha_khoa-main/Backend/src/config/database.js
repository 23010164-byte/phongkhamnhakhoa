const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'clinic_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    timezone: '+07:00',
    logging: process.env.NODE_ENV === 'development'
      ? (sql) => logger.debug(sql)
      : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: false,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

const connectDB = async (retries = 5, delay = 5000) => {
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      logger.info('✅ Database kết nối thành công');

      if (process.env.DB_SYNC === 'true') {
        await sequelize.sync({ alter: process.env.DB_SYNC_ALTER === 'true' });
        logger.info('✅ Database sync hoàn tất');
      }
      return; // Thành công thì thoát vòng lặp
    } catch (error) {
      retries -= 1;
      logger.error(`❌ Kết nối database thất bại. Còn ${retries} lần thử lại... Lỗi: ${error.message}`);
      if (retries === 0) {
        throw error; // Hết số lần thử thì văng lỗi
      }
      // Chờ trước khi thử lại
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

module.exports = { sequelize, connectDB };
