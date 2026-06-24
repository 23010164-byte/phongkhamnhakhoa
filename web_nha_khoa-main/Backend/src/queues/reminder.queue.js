const { Queue, Worker } = require('bullmq');
const { createBullMQConnection } = require('../config/redis');
const logger = require('../utils/logger');
const { QUEUE_NAMES } = require('../utils/constants');

const connection = createBullMQConnection();

const appointmentReminderQueue = new Queue(QUEUE_NAMES.APPOINTMENT_REMINDER, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: 50,
    removeOnFail: 20,
  },
});

const reminderWorker = new Worker(
  QUEUE_NAMES.APPOINTMENT_REMINDER,
  async (job) => {
    const { type } = job.data;
    logger.info(`[ReminderQueue] Processing: ${type}`);

    if (type === 'DAILY_REMINDER') {
      const dayjs = require('dayjs');
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');

      const appointmentRepository = require('../modules/appointment/appointment.repository');
      const notificationService = require('../modules/notification/notification.service');
      const userRepository = require('../modules/user/user.repository');

      const appointments = await appointmentRepository.findPendingReminders(tomorrow);
      logger.info(`[ReminderQueue] Gửi nhắc nhở cho ${appointments.length} lịch hẹn ngày ${tomorrow}`);

      for (const appt of appointments) {
        try {
          const patient = await userRepository.findById(appt.patient_id);
          await notificationService.notifyAppointmentReminder(appt, patient?.email);

          // Đánh dấu đã gửi
          await appointmentRepository.update(appt.id, { reminder_sent: true });
        } catch (err) {
          logger.error(`[ReminderQueue] Gửi nhắc nhở thất bại cho appointment ${appt.id}:`, err.message);
        }
      }
    }
  },
  { connection, concurrency: 1 }
);

reminderWorker.on('completed', (job) => logger.info(`[ReminderQueue] Job ${job.id} done`));
reminderWorker.on('failed', (job, err) => logger.error(`[ReminderQueue] Job ${job?.id} failed:`, err.message));

// Lên lịch cron hàng ngày lúc 20:00 gửi nhắc nhở ngày hôm sau
const scheduleDailyReminder = async () => {
  // Xóa job cũ nếu có
  const repeatableJobs = await appointmentReminderQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await appointmentReminderQueue.removeRepeatableByKey(job.key);
  }

  await appointmentReminderQueue.add(
    'daily-reminder',
    { type: 'DAILY_REMINDER' },
    {
      repeat: { cron: '0 20 * * *' }, // 20:00 mỗi ngày
      attempts: 3,
    }
  );

  logger.info('[ReminderQueue] Đã lên lịch nhắc nhở hàng ngày lúc 20:00');
};

module.exports = { appointmentReminderQueue, reminderWorker, scheduleDailyReminder };
