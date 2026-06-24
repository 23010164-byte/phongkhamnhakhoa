require('dotenv').config();
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');
const setupAssociations = require('../config/associations');
const { APPOINTMENT_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } = require('../utils/constants');
const crypto = require('crypto');

// Import models
const User = require('../modules/user/user.model');
const DoctorProfile = require('../modules/doctor/doctor.model');
const Service = require('../modules/service/service.model');
const Appointment = require('../modules/appointment/appointment.model');
const Payment = require('../modules/payment/payment.model');

// Generate random booking code
const generateBookingCode = () => 'BK' + crypto.randomBytes(3).toString('hex').toUpperCase();
const generateTransactionCode = () => 'TX' + crypto.randomBytes(4).toString('hex').toUpperCase();

setupAssociations();

const seedPayments = async () => {
  const t = await sequelize.transaction();
  try {
    logger.info('🌱 Bắt đầu tạo dữ liệu mẫu thanh toán...');
    await sequelize.authenticate();

    // Lấy thông tin user
    const patient1 = await User.findOne({ where: { email: 'benhnhan1@gmail.com' } });
    const patient2 = await User.findOne({ where: { email: 'benhnhan2@gmail.com' } });
    const doctorUser = await User.findOne({ where: { email: 'bs.minh@phongkham.vn' } });
    
    if (!patient1 || !patient2 || !doctorUser) {
      throw new Error('Không tìm thấy dữ liệu user cơ bản. Vui lòng chạy "npm run seed" trước.');
    }

    const doctorProfile = await DoctorProfile.findOne({ where: { user_id: doctorUser.id } });
    
    // Lấy thông tin dịch vụ để tính tiền
    const services = await Service.findAll({ limit: 3 });
    if (services.length < 2) {
      throw new Error('Chưa có dịch vụ. Vui lòng chạy "npm run seed" trước.');
    }

    // 1. Tạo lịch hẹn (để có thể thanh toán)
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const [appt1] = await Appointment.findOrCreate({
      where: { patient_id: patient1.id, appointment_date: yesterday },
      defaults: {
        booking_code: generateBookingCode(),
        patient_id: patient1.id,
        doctor_profile_id: doctorProfile.id,
        service_id: services[0].id,
        appointment_date: yesterday,
        appointment_time: '14:00',
        status: APPOINTMENT_STATUS.COMPLETED,
        payment_status: PAYMENT_STATUS.PAID,
        reason: 'Khám và lấy vôi răng'
      },
      transaction: t,
    });

    const [appt2] = await Appointment.findOrCreate({
      where: { patient_id: patient2.id, appointment_date: today },
      defaults: {
        booking_code: generateBookingCode(),
        patient_id: patient2.id,
        doctor_profile_id: doctorProfile.id,
        service_id: services[1].id,
        appointment_date: today,
        appointment_time: '09:00',
        status: APPOINTMENT_STATUS.COMPLETED, // Đã khám xong, ra quầy tính tiền
        payment_status: PAYMENT_STATUS.PENDING,
        reason: 'Nhổ răng khôn'
      },
      transaction: t,
    });

    // 2. Tạo dữ liệu thanh toán
    // Thanh toán 1: Đã thanh toán chuyển khoản
    await Payment.findOrCreate({
      where: { appointment_id: appt1.id },
      defaults: {
        appointment_id: appt1.id,
        user_id: patient1.id,
        transaction_code: generateTransactionCode(),
        amount: services[0].price || 250000,
        method: PAYMENT_METHOD.TRANSFER,
        status: PAYMENT_STATUS.PAID,
        paid_at: new Date(Date.now() - 3600000), // Cách đây 1 tiếng
      },
      transaction: t,
    });

    // Thanh toán 2: Chờ thanh toán tiền mặt (Đang đứng ở quầy)
    await Payment.findOrCreate({
      where: { appointment_id: appt2.id },
      defaults: {
        appointment_id: appt2.id,
        user_id: patient2.id,
        transaction_code: generateTransactionCode(),
        amount: services[1].price || 1500000,
        method: PAYMENT_METHOD.CASH,
        status: PAYMENT_STATUS.PENDING,
      },
      transaction: t,
    });

    // Thanh toán 3: Tạo thêm một hoá đơn độc lập giả lập (Có thể do mua thêm thuốc)
    const [appt3] = await Appointment.findOrCreate({
      where: { patient_id: patient1.id, appointment_date: today },
      defaults: {
        booking_code: generateBookingCode(),
        patient_id: patient1.id,
        doctor_profile_id: doctorProfile.id,
        service_id: services[2].id,
        appointment_date: today,
        appointment_time: '10:30',
        status: APPOINTMENT_STATUS.COMPLETED,
        payment_status: PAYMENT_STATUS.PAID,
        reason: 'Khám tổng quát'
      },
      transaction: t,
    });

    await Payment.findOrCreate({
      where: { appointment_id: appt3.id },
      defaults: {
        appointment_id: appt3.id,
        user_id: patient1.id,
        transaction_code: generateTransactionCode(),
        amount: services[2].price || 500000,
        method: PAYMENT_METHOD.VNPAY,
        status: PAYMENT_STATUS.PAID,
        paid_at: new Date(),
      },
      transaction: t,
    });

    await t.commit();
    logger.info('🎉 Tạo dữ liệu thanh toán thành công!');
    logger.info('- Đã tạo 3 giao dịch thanh toán (1 chờ thu tiền, 2 đã thanh toán).');
    process.exit(0);
  } catch (error) {
    await t.rollback();
    logger.error('❌ Lỗi tạo dữ liệu:', error);
    process.exit(1);
  }
};

seedPayments();
