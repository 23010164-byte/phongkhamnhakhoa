const logger = require('../utils/logger');

let notificationQueue, notificationWorker;
let appointmentReminderQueue, reminderWorker, scheduleDailyReminder;

const initQueues = async () => {
  try {
    // Lazy import để tránh crash nếu Redis chưa sẵn sàng
    ({ notificationQueue, notificationWorker } = require('./notification.queue'));
    ({ appointmentReminderQueue, reminderWorker, scheduleDailyReminder } = require('./reminder.queue'));

    // Lên lịch nhắc nhở hàng ngày
    await scheduleDailyReminder();

    logger.info('✅ BullMQ queues đã khởi động');
  } catch (error) {
    logger.error('❌ Khởi động queues thất bại:', error.message);
    // Không throw — queue không phải critical path
  }
};

const getNotificationQueue = () => notificationQueue;
const getAppointmentReminderQueue = () => appointmentReminderQueue;

module.exports = {
  initQueues,
  getNotificationQueue,
  getAppointmentReminderQueue,
};
