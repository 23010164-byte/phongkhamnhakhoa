require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/database');
const { redis } = require('./config/redis');
const { initSocket } = require('./socket');
const { initQueues } = require('./queues');
const logger = require('./utils/logger'); // Trigger restart

const PORT = parseInt(process.env.PORT) || 5000;
const server = http.createServer(app);

// Khởi động Socket.io
initSocket(server);

const start = async () => {
  try {
    // 1. Kết nối DB
    await connectDB();

    // 2. Kiểm tra Redis
    try {
      await redis.ping();
      logger.info('✅ Redis sẵn sàng');
    } catch (err) {
      logger.warn('⚠️ Redis không phản hồi. Server vẫn tiếp tục chạy nhưng các chức năng cache/queue có thể bị lỗi.');
    }

    // 3. Khởi động BullMQ queues
    await initQueues();

    // 4. Khởi động HTTP server
    server.listen(PORT, () => {
      logger.info(`🚀 Server đang chạy tại http://localhost:${PORT}`);
      logger.info(`📋 Môi trường  : ${process.env.NODE_ENV}`);
      logger.info(`📡 API Base    : http://localhost:${PORT}/api/v1`);
      logger.info(`🔌 Socket.io   : ws://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Khởi động server thất bại:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`\n⚠️  Nhận tín hiệu ${signal}, đang shutdown...`);
  server.close(async () => {
    logger.info('🔌 HTTP server đã đóng');
    try {
      await redis.quit();
      logger.info('🔌 Redis đã đóng');
    } catch {}
    logger.info('✅ Shutdown hoàn tất');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('⏱️  Shutdown timeout, force exit');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  logger.error('💥 Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error('💥 Unhandled Rejection:', reason);
  process.exit(1);
});

start();
// trigger restart 2

