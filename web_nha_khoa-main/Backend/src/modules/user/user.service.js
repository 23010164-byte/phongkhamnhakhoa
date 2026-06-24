const bcrypt = require('bcryptjs');
const userRepository = require('./user.repository');
const { AppError } = require('../../middlewares/error.middleware');
const { getPagination } = require('../../utils/helpers');
const { ROLES } = require('../../utils/constants');
const cloudinary = require('../../config/cloudinary');
const logger = require('../../utils/logger');

const userService = {
  // --------------------
  // LẤY PROFILE CÁ NHÂN
  // --------------------
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('Không tìm thấy người dùng', 404);
    return user;
  },

  // --------------------
  // CẬP NHẬT PROFILE
  // --------------------
  async updateProfile(userId, data) {
    const {
      fullName, phone, gender, dateOfBirth, address,
      bloodType, allergies, emergencyContactName, emergencyContactPhone,
    } = data;

    // Kiểm tra phone trùng
    if (phone) {
      const existing = await userRepository.findAll({ limit: 1, offset: 0, search: phone });
      const conflict = existing.users.find((u) => u.phone === phone && u.id !== userId);
      if (conflict) throw new AppError('Số điện thoại đã được sử dụng', 409);
    }

    const updated = await userRepository.update(userId, {
      full_name: fullName,
      phone,
      gender,
      date_of_birth: dateOfBirth,
      address,
      blood_type: bloodType,
      allergies,
      emergency_contact_name: emergencyContactName,
      emergency_contact_phone: emergencyContactPhone,
    });

    return updated;
  },

  // --------------------
  // CẬP NHẬT AVATAR
  // --------------------
  async updateAvatar(userId, file) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('Không tìm thấy người dùng', 404);

    // Xóa avatar cũ trên Cloudinary
    if (user.avatar_public_id) {
      await cloudinary.uploader.destroy(user.avatar_public_id)
        .catch((e) => logger.warn('Xóa avatar cũ thất bại:', e.message));
    }

    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'clinic/avatars',
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      format: 'webp',
    });

    return userRepository.update(userId, {
      avatar: result.secure_url,
      avatar_public_id: result.public_id,
    });
  },

  // --------------------
  // ADMIN: DANH SÁCH USERS
  // --------------------
  async getAllUsers(query) {
    const { page, limit, offset } = getPagination(query);
    const { role, search } = query;
    const isActive = typeof query.isActive !== 'undefined'
      ? query.isActive === 'true'
      : undefined;

    return userRepository.findAll({ page, limit, offset, role, isActive, search });
  },

  // --------------------
  // ADMIN: DANH SÁCH BỆNH NHÂN
  // --------------------
  async getPatients(query) {
    const { page, limit, offset } = getPagination(query);
    const { search } = query;
    return userRepository.findPatients({ page, limit, offset, search });
  },

  // --------------------
  // TẠO USER (Lễ tân / Admin)
  // --------------------
  async createUser(data, callerRole) {
    const { fullName, email, phone, password, gender, dateOfBirth } = data;
    // Lễ tân chỉ được tạo tài khoản bệnh nhân
    const role = callerRole === ROLES.RECEPTIONIST ? ROLES.PATIENT : (data.role || ROLES.PATIENT);

    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) throw new AppError('Email đã tồn tại', 409);

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    return userRepository.create({
      full_name: fullName,
      email: email.toLowerCase(),
      phone,
      password_hash: passwordHash,
      role,
      gender,
      date_of_birth: dateOfBirth,
      is_active: true,
      is_verified: true, // Nhân viên tạo thì tự động verified
    });
  },

  // --------------------
  // ADMIN: LẤY USER THEO ID
  // --------------------
  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError('Không tìm thấy người dùng', 404);
    return user;
  },

  // --------------------
  // ADMIN: CẬP NHẬT USER
  // --------------------
  async updateUser(id, data) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError('Không tìm thấy người dùng', 404);

    const { fullName, phone, role, gender, dateOfBirth, address, isActive } = data;

    return userRepository.update(id, {
      full_name: fullName,
      phone,
      role,
      gender,
      date_of_birth: dateOfBirth,
      address,
      is_active: isActive,
    });
  },

  // --------------------
  // ADMIN: TOGGLE ACTIVE
  // --------------------
  async toggleUserActive(id) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError('Không tìm thấy người dùng', 404);

    return userRepository.toggleActive(id);
  },

  // --------------------
  // ADMIN: XÓA USER
  // --------------------
  async deleteUser(id) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError('Không tìm thấy người dùng', 404);

    // Không cho xóa admin cuối cùng
    if (user.role === ROLES.ADMIN) {
      const adminCount = (await userRepository.countByRole())[ROLES.ADMIN] || 0;
      if (adminCount <= 1) {
        throw new AppError('Không thể xóa admin duy nhất của hệ thống', 400);
      }
    }

    await userRepository.delete(id);
    return true;
  },
};

module.exports = userService;
