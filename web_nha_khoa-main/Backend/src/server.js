require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/database');
const { redis } = require('./config/redis');
const { initSocket } = require('./socket');
const { initQueues } = require('./queues');
const logger = require('./utils/logger'); // Khoi dong lai he thong tai day

const PORT = parseInt(process.env.PORT) || 5000;
const server = http.createServer(app);

// Chay module Socket.io cua he thong
initSocket(server);

const batDauHeThong = async () => {
  try {
    // 1. Tien hanh ket noi database nha khoa
    await connectDB();

    // 2. Kiem tra trang thai bo nho dem Redis
    try {
      await redis.ping();
      logger.info('==> [CHINH CHU] He thong Bo nho dem Redis da san sang ket noi');
    } catch (err) {
      logger.warn('==> [CANH BAO] Redis dang tam thoi ngat link. He thong van hoat dong dong bo nhung tinh nang cache va queue can luu y.');
    }

    // 3. Kick hoat luong cong viec BullMQ
    await initQueues();

    // 4. Kich hoat HTTP Server bai tap lon
    server.listen(PORT, () => {
      logger.info('========================================================');
      logger.info(`*** APP CLINIC: HE THONG QUAN LY PHONG KHAM NHA KHOA ***`);
      logger.info(`==> Server nghien cuu dang tai: http://localhost:${PORT}`);
      logger.info(`==> Che do chay (Environment)  : ${process.env.NODE_ENV || 'BCTL-Development'}`);
      logger.info(`==> Duong dan API Base         : http://localhost:${PORT}/api/v1`);
      logger.info(`==> Cong ket noi Socket.io     : ws://localhost:${PORT}`);
      logger.info('========================================================');
    });
  } catch (error) {
    logger.error('==> [LOI MAT] Khoi dong server nha khoa khong thanh cong:', error);
    process.exit(1);
  }
};

// Dong he thong an toan (Graceful shutdown)
const dungHeThongAnToan = async (tinHieu) => {
  logger.info(`\n==> [HE THONG] Nhan duoc tin hieu ${tinHieu}, bat dau quy trinh dong safely...`);
  server.close(async () => {
    logger.info('==> Port HTTP Server da dong ket noi');
    try {
      await redis.quit();
      logger.info('==> Cong ket noi Redis da dong safely');
    } catch {}
    logger.info('==> [THANH CONG] Toan bo tien trinh backend da dung han.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('==> [TIMEOUT] Thoi gian cho tat qua lau, ep buoc ngat he thong.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => dungHeThongAnToan('SIGTERM'));
process.on('SIGINT', () => dungHeThongAnToan('SIGINT'));
process.on('uncaughtException', (err) => {
  logger.error('==> [CRITICAL LOI] Ngoai le chua duoc bat (Uncaught Exception):', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error('==> [CRITICAL LOI] Tu choi chua duoc xu ly (Unhandled Rejection):', reason);
  process.exit(1);
});

// Chay ung dung
batDauHeThong();
