require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const logger = require('../utils/logger');
const setupAssociations = require('../config/associations');
const { ROLES, GENDER, DAYS_OF_WEEK, BLOG_STATUS } = require('../utils/constants');

// Import models
const User = require('../modules/user/user.model');
const DoctorProfile = require('../modules/doctor/doctor.model');
const Specialty = require('../modules/service/specialty.model');
const Service = require('../modules/service/service.model');
const BlogCategory = require('../modules/blog/blog.model').BlogCategory;
const { Blog } = require('../modules/blog/blog.model');

// Khởi tạo associations trước khi dùng
setupAssociations();

const seed = async () => {
  const t = await sequelize.transaction();
  try {
    logger.info('🌱 Bắt đầu seeding...');
    await sequelize.authenticate();

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const password = await bcrypt.hash('Password@123', saltRounds);

    // ========================
    // 1. USERS
    // ========================
    const [admin] = await User.findOrCreate({
      where: { email: 'admin@phongkham.vn' },
      defaults: {
        full_name: 'Quản Trị Viên',
        email: 'admin@phongkham.vn',
        phone: '0901000001',
        password_hash: password,
        role: ROLES.ADMIN,
        gender: GENDER.MALE,
        is_active: true,
        is_verified: true,
      },
      transaction: t,
    });

    const [receptionist] = await User.findOrCreate({
      where: { email: 'letan@phongkham.vn' },
      defaults: {
        full_name: 'Nguyễn Thị Lan',
        email: 'letan@phongkham.vn',
        phone: '0901000002',
        password_hash: password,
        role: ROLES.RECEPTIONIST,
        gender: GENDER.FEMALE,
        is_active: true,
        is_verified: true,
      },
      transaction: t,
    });

    const [doctorUser1] = await User.findOrCreate({
      where: { email: 'bs.minh@phongkham.vn' },
      defaults: {
        full_name: 'BS. Trần Văn Minh',
        email: 'bs.minh@phongkham.vn',
        phone: '0901000003',
        password_hash: password,
        role: ROLES.DOCTOR,
        gender: GENDER.MALE,
        is_active: true,
        is_verified: true,
      },
      transaction: t,
    });

    const [doctorUser2] = await User.findOrCreate({
      where: { email: 'bs.hoa@phongkham.vn' },
      defaults: {
        full_name: 'BS. Lê Thị Hoa',
        email: 'bs.hoa@phongkham.vn',
        phone: '0901000004',
        password_hash: password,
        role: ROLES.DOCTOR,
        gender: GENDER.FEMALE,
        is_active: true,
        is_verified: true,
      },
      transaction: t,
    });

    const [patient1] = await User.findOrCreate({
      where: { email: 'benhnhan1@gmail.com' },
      defaults: {
        full_name: 'Phạm Văn An',
        email: 'benhnhan1@gmail.com',
        phone: '0912345601',
        password_hash: password,
        role: ROLES.PATIENT,
        gender: GENDER.MALE,
        date_of_birth: new Date('1990-05-15'),
        address: '123 Đường Lê Lợi, Q.1, TP.HCM',
        is_active: true,
        is_verified: true,
      },
      transaction: t,
    });

    const [patient2] = await User.findOrCreate({
      where: { email: 'benhnhan2@gmail.com' },
      defaults: {
        full_name: 'Trần Thị Bình',
        email: 'benhnhan2@gmail.com',
        phone: '0912345602',
        password_hash: password,
        role: ROLES.PATIENT,
        gender: GENDER.FEMALE,
        date_of_birth: new Date('1985-08-22'),
        address: '45 Nguyễn Huệ, Q.1, TP.HCM',
        is_active: true,
        is_verified: true,
      },
      transaction: t,
    });

    logger.info('✅ Seeded: Users');

    // ========================
    // 2. SPECIALTIES
    // ========================
    const specialties = await Promise.all([
      Specialty.findOrCreate({
        where: { slug: 'nha-khoa-tong-quat' },
        defaults: { name: 'Nha khoa tổng quát', slug: 'nha-khoa-tong-quat', description: 'Khám, tư vấn và điều trị răng miệng cơ bản', icon: '🪥', is_active: true },
        transaction: t,
      }),
      Specialty.findOrCreate({
        where: { slug: 'nha-khoa-tre-em' },
        defaults: { name: 'Nha khoa trẻ em', slug: 'nha-khoa-tre-em', description: 'Chăm sóc và điều trị răng miệng cho trẻ nhỏ', icon: '👶', is_active: true },
        transaction: t,
      }),
      Specialty.findOrCreate({
        where: { slug: 'chinh-nha' },
        defaults: { name: 'Chỉnh nha - Niềng răng', slug: 'chinh-nha', description: 'Chỉnh nha, niềng răng thẩm mỹ', icon: '😁', is_active: true },
        transaction: t,
      }),
      Specialty.findOrCreate({
        where: { slug: 'cay-ghep-implant' },
        defaults: { name: 'Cấy ghép Implant', slug: 'cay-ghep-implant', description: 'Phục hình răng đã mất bằng Implant', icon: '🔩', is_active: true },
        transaction: t,
      }),
      Specialty.findOrCreate({
        where: { slug: 'nho-rang-tieu-phau' },
        defaults: { name: 'Nhổ răng - Tiểu phẫu', slug: 'nho-rang-tieu-phau', description: 'Nhổ răng khôn, tiểu phẫu trong miệng', icon: '💉', is_active: true },
        transaction: t,
      }),
    ]);

    const [tongquatSpec] = specialties[0];
    const [treemSpec] = specialties[1];
    const [chinhnhaSpec] = specialties[2];
    const [implantSpec] = specialties[3];
    logger.info('✅ Seeded: Specialties');

    // ========================
    // 3. SERVICES
    // ========================
    await Promise.all([
      Service.findOrCreate({
        where: { name: 'Khám và tư vấn răng miệng' },
        defaults: {
          name: 'Khám và tư vấn răng miệng',
          slug: 'kham-tu-van-rang-mieng',
          specialty_id: tongquatSpec.id,
          price: 150000,
          duration_minutes: 30,
          description: 'Khám tổng quát, chụp X-quang và tư vấn phác đồ điều trị',
          is_active: true,
        },
        transaction: t,
      }),
      Service.findOrCreate({
        where: { name: 'Cạo vôi răng - Đánh bóng' },
        defaults: {
          name: 'Cạo vôi răng - Đánh bóng',
          slug: 'cao-voi-rang',
          specialty_id: tongquatSpec.id,
          price: 250000,
          duration_minutes: 30,
          description: 'Làm sạch mảng bám, vôi răng và đánh bóng',
          is_active: true,
        },
        transaction: t,
      }),
      Service.findOrCreate({
        where: { name: 'Nhổ răng sữa' },
        defaults: {
          name: 'Nhổ răng sữa',
          slug: 'nho-rang-sua',
          specialty_id: treemSpec.id,
          price: 100000,
          duration_minutes: 15,
          description: 'Nhổ răng sữa an toàn, không đau cho bé',
          is_active: true,
        },
        transaction: t,
      }),
      Service.findOrCreate({
        where: { name: 'Nhổ răng khôn (Răng số 8)' },
        defaults: {
          name: 'Nhổ răng khôn (Răng số 8)',
          slug: 'nho-rang-khon',
          specialty_id: implantSpec.id, // using implant/surgery
          price: 1500000,
          duration_minutes: 60,
          description: 'Tiểu phẫu nhổ răng khôn mọc lệch, mọc ngầm',
          is_active: true,
        },
        transaction: t,
      }),
      Service.findOrCreate({
        where: { name: 'Niềng răng mắc cài kim loại' },
        defaults: {
          name: 'Niềng răng mắc cài kim loại',
          slug: 'nieng-rang-mac-cai-kim-loai',
          specialty_id: chinhnhaSpec.id,
          price: 35000000,
          duration_minutes: 60,
          description: 'Chỉnh nha bằng mắc cài kim loại chuẩn',
          is_active: true,
        },
        transaction: t,
      }),
    ]);
    logger.info('✅ Seeded: Services');

    // ========================
    // 4. DOCTOR PROFILES
    // ========================
    await DoctorProfile.findOrCreate({
      where: { user_id: doctorUser1.id },
      defaults: {
        user_id: doctorUser1.id,
        specialty_id: tongquatSpec.id,
        title: 'Thạc sĩ, Bác sĩ',
        bio: 'Bác sĩ Trần Văn Minh có hơn 10 năm kinh nghiệm trong lĩnh vực nội khoa.',
        experience_years: 10,
        consultation_fee: 250000,
        working_days: [DAYS_OF_WEEK.MONDAY, DAYS_OF_WEEK.WEDNESDAY, DAYS_OF_WEEK.FRIDAY],
        working_start: '08:00',
        working_end: '17:00',
        slot_duration_minutes: 30,
        is_available: true,
        certificate: 'Bằng chuyên khoa I Nội khoa - Đại học Y Dược TP.HCM',
        education: 'Đại học Y Dược TP.HCM',
      },
      transaction: t,
    });

    await DoctorProfile.findOrCreate({
      where: { user_id: doctorUser2.id },
      defaults: {
        user_id: doctorUser2.id,
        specialty_id: treemSpec.id,
        title: 'Bác sĩ chuyên khoa I',
        bio: 'Bác sĩ Lê Thị Hoa có kinh nghiệm 8 năm trong chuyên khoa nhi.',
        experience_years: 8,
        consultation_fee: 220000,
        working_days: [DAYS_OF_WEEK.TUESDAY, DAYS_OF_WEEK.THURSDAY, DAYS_OF_WEEK.SATURDAY],
        working_start: '07:30',
        working_end: '16:30',
        slot_duration_minutes: 30,
        is_available: true,
        certificate: 'Bằng chuyên khoa I Nhi khoa',
        education: 'Đại học Y Hà Nội',
      },
      transaction: t,
    });
    logger.info('✅ Seeded: Doctor profiles');

    // ========================
    // 5. BLOG CATEGORIES
    // ========================
    await Promise.all([
      BlogCategory.findOrCreate({
        where: { slug: 'suc-khoe-tong-quat' },
        defaults: { name: 'Sức khỏe tổng quát', slug: 'suc-khoe-tong-quat', description: 'Tin tức và kiến thức sức khỏe chung' },
        transaction: t,
      }),
      BlogCategory.findOrCreate({
        where: { slug: 'dinh-duong' },
        defaults: { name: 'Dinh dưỡng', slug: 'dinh-duong', description: 'Chế độ ăn uống và dinh dưỡng hợp lý' },
        transaction: t,
      }),
      BlogCategory.findOrCreate({
        where: { slug: 'vaccine-phong-benh' },
        defaults: { name: 'Vaccine & Phòng bệnh', slug: 'vaccine-phong-benh', description: 'Thông tin về tiêm chủng và phòng ngừa dịch bệnh' },
        transaction: t,
      }),
    ]);
    logger.info('✅ Seeded: Blog categories');

    // ========================
    // 6. SHIFTS & ROSTERS
    // ========================
    try {
      const Shift = require('../modules/shift/shift.model');
      const Roster = require('../modules/roster/roster.model');

      const [shiftMorning] = await Shift.findOrCreate({
        where: { name: 'Ca Sáng' },
        defaults: {
          name: 'Ca Sáng',
          start_time: '08:00',
          end_time: '12:00',
          description: 'Ca làm việc buổi sáng',
          is_active: true
        },
        transaction: t
      });

      const [shiftAfternoon] = await Shift.findOrCreate({
        where: { name: 'Ca Chiều' },
        defaults: {
          name: 'Ca Chiều',
          start_time: '13:00',
          end_time: '17:00',
          description: 'Ca làm việc buổi chiều',
          is_active: true
        },
        transaction: t
      });

      // Tạo lịch trực cho bác sĩ Minh vào ngày mai (Ca sáng)
      const dayjs = require('dayjs');
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
      
      const doctor1 = await DoctorProfile.findOne({ where: { user_id: doctorUser1.id } });
      const doctor2 = await DoctorProfile.findOne({ where: { user_id: doctorUser2.id } });

      if (doctor1) {
        await Roster.findOrCreate({
          where: { doctor_profile_id: doctor1.id, shift_id: shiftMorning.id, roster_date: tomorrow },
          defaults: {
            doctor_profile_id: doctor1.id,
            shift_id: shiftMorning.id,
            roster_date: tomorrow,
            status: 'approved',
            notes: 'Lịch tự động seed'
          },
          transaction: t
        });
      }

      if (doctor2) {
        await Roster.findOrCreate({
          where: { doctor_profile_id: doctor2.id, shift_id: shiftAfternoon.id, roster_date: tomorrow },
          defaults: {
            doctor_profile_id: doctor2.id,
            shift_id: shiftAfternoon.id,
            roster_date: tomorrow,
            status: 'approved',
            notes: 'Lịch tự động seed'
          },
          transaction: t
        });
      }
      logger.info('✅ Seeded: Shifts & Rosters');
    } catch (err) {
      logger.warn('⚠️ Bỏ qua seeding Shifts & Rosters vì module chưa sẵn sàng hoặc lỗi: ' + err.message);
    }

    await t.commit();
    logger.info('🎉 Seeding hoàn thành!');
    logger.info('');
    logger.info('📋 Tài khoản mặc định (mật khẩu: Password@123):');
    logger.info('   Admin       : admin@phongkham.vn');
    logger.info('   Lễ tân      : letan@phongkham.vn');
    logger.info('   Bác sĩ 1    : bs.minh@phongkham.vn');
    logger.info('   Bác sĩ 2    : bs.hoa@phongkham.vn');
    logger.info('   Bệnh nhân 1 : benhnhan1@gmail.com');
    logger.info('   Bệnh nhân 2 : benhnhan2@gmail.com');
    process.exit(0);
  } catch (error) {
    await t.rollback();
    logger.error('❌ Seeding thất bại:', error);
    process.exit(1);
  }
};

seed();
