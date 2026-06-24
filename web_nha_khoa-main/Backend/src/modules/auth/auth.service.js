const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const jwtConfig = require('../../config/jwt');
const { cache } = require('../../config/redis');
const { sendMail } = require('../../config/mailer');
const authRepository = require('./auth.repository');
const userRepository = require('../user/user.repository');
const { AppError } = require('../../middlewares/error.middleware');
const { ROLES } = require('../../utils/constants');
const { generateOTP, addMinutes, addDays } = require('../../utils/helpers');
const logger = require('../../utils/logger');
const emailTemplates = require('../../utils/emailTemplates');

// ========================
// TOKEN HELPERS
// ========================
const generateACCESS_TOKEN = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtConfig.access.secret,
    { expiresIn: jwtConfig.access.expiresIn }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    jwtConfig.refresh.secret,
    { expiresIn: jwtConfig.refresh.expiresIn }
  );
};

const getTokenExpiry = (expiresIn) => {
  const units = { m: 'minute', h: 'hour', d: 'day' };
  const match = expiresIn.match(/^(\d+)([mhd])$/);
  if (!match) return addDays(new Date(), 7);
  const [, val, unit] = match;
  const ms = { m: 60000, h: 3600000, d: 86400000 }[unit];
  return new Date(Date.now() + parseInt(val) * ms);
};

// ========================
// AUTH SERVICE
// ========================
const authService = {
  // --------------------
  // ĐĂNG KÝ
  // --------------------
  async register({ fullName, email, phone, password, gender, dateOfBirth }) {
    // Kiểm tra email đã tồn tại
    const existingEmail = await authRepository.findUserByEmail(email);
    if (existingEmail) {
      throw new AppError('Email đã được sử dụng', 409);
    }

    // Kiểm tra phone đã tồn tại
    if (phone) {
      const existingPhone = await authRepository.findUserByPhone(phone);
      if (existingPhone) {
        throw new AppError('Số điện thoại đã được sử dụng', 409);
      }
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Tạo OTP xác thực email
    const otp = generateOTP(6);
    const otpExpiry = addMinutes(new Date(), 15);

    const user = await userRepository.create({
      full_name: fullName,
      email: email.toLowerCase(),
      phone,
      password_hash: passwordHash,
      role: ROLES.PATIENT, // Mặc định đăng ký = bệnh nhân
      gender,
      date_of_birth: dateOfBirth,
      is_active: true,
      is_verified: false,
      email_verify_token: otp,
      email_verify_expires: otpExpiry,
    });

    // Gửi email xác thực (non-blocking)
    sendMail({
      to: user.email,
      subject: 'Xác thực tài khoản Phòng Khám',
      html: emailTemplates.verifyEmail({ fullName: user.full_name, otp }),
    }).catch((err) => logger.error('Gửi email xác thực thất bại:', err.message));

    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      isVerified: user.is_verified,
    };
  },

  // --------------------
  // XÁC THỰC EMAIL
  // --------------------
  async verifyEmail(email, otp) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) throw new AppError('Email không tồn tại', 404);
    if (user.is_verified) throw new AppError('Email đã được xác thực', 400);
    if (user.email_verify_token !== otp) throw new AppError('Mã OTP không đúng', 400);
    if (new Date() > new Date(user.email_verify_expires)) {
      throw new AppError('Mã OTP đã hết hạn, vui lòng yêu cầu mã mới', 400);
    }

    await userRepository.update(user.id, {
      is_verified: true,
      email_verify_token: null,
      email_verify_expires: null,
    });

    return true;
  },

  // --------------------
  // GỬI LẠI OTP
  // --------------------
  async resendVerifyEmail(email) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) throw new AppError('Email không tồn tại', 404);
    if (user.is_verified) throw new AppError('Email đã được xác thực', 400);

    const otp = generateOTP(6);
    const otpExpiry = addMinutes(new Date(), 15);

    await userRepository.update(user.id, {
      email_verify_token: otp,
      email_verify_expires: otpExpiry,
    });

    await sendMail({
      to: user.email,
      subject: 'Mã xác thực mới - Phòng Khám',
      html: emailTemplates.verifyEmail({ fullName: user.full_name, otp }),
    });

    return true;
  },

  // --------------------
  // ĐĂNG NHẬP
  // --------------------
  async login({ email, password, ipAddress, userAgent }) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) throw new AppError('Email hoặc mật khẩu không đúng', 401);

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) throw new AppError('Email hoặc mật khẩu không đúng', 401);

    if (!user.is_active) {
      throw new AppError('Tài khoản đã bị vô hiệu hóa, vui lòng liên hệ admin', 403);
    }

    if (!user.is_verified) {
      throw new AppError('Vui lòng xác thực email trước khi đăng nhập', 403);
    }

    // Cập nhật lần đăng nhập cuối
    await userRepository.update(user.id, { last_login_at: new Date() });

    const ACCESS_TOKEN = generateACCESS_TOKEN(user);
    const refreshToken = generateRefreshToken(user);
    const refreshExpiry = getTokenExpiry(jwtConfig.refresh.expiresIn);

    // Lưu refresh token vào DB
    await authRepository.createRefreshToken({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshExpiry,
      ipAddress,
      userAgent,
    });

    return {
      ACCESS_TOKEN,
      refreshToken,
      expiresIn: jwtConfig.access.expiresIn,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.is_verified,
      },
    };
  },

  // --------------------
  // REFRESH TOKEN
  // --------------------
  async refreshToken(token) {
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(token, jwtConfig.refresh.secret);
    } catch {
      throw new AppError('Refresh token không hợp lệ hoặc đã hết hạn', 401);
    }

    // Tìm trong DB
    const storedToken = await authRepository.findRefreshToken(token);
    if (!storedToken) throw new AppError('Refresh token không tồn tại hoặc đã bị thu hồi', 401);
    if (new Date() > new Date(storedToken.expires_at)) {
      throw new AppError('Refresh token đã hết hạn, vui lòng đăng nhập lại', 401);
    }

    const user = await authRepository.findUserById(decoded.id);
    if (!user || !user.is_active) throw new AppError('Tài khoản không tồn tại hoặc bị khóa', 401);

    // Xoay vòng token: revoke cũ, tạo mới
    await authRepository.revokeRefreshToken(token);

    const newACCESS_TOKEN = generateACCESS_TOKEN(user);
    const newRefreshToken = generateRefreshToken(user);
    const refreshExpiry = getTokenExpiry(jwtConfig.refresh.expiresIn);

    await authRepository.createRefreshToken({
      userId: user.id,
      token: newRefreshToken,
      expiresAt: refreshExpiry,
    });

    return {
      ACCESS_TOKEN: newACCESS_TOKEN,
      refreshToken: newRefreshToken,
      expiresIn: jwtConfig.access.expiresIn,
    };
  },

  // --------------------
  // ĐĂNG XUẤT
  // --------------------
  async logout(ACCESS_TOKEN, refreshToken) {
    // Blacklist access token trong Redis
    try {
      const decoded = jwt.decode(ACCESS_TOKEN);
      if (decoded?.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await cache.blacklistToken(ACCESS_TOKEN, ttl);
        }
      }
    } catch {}

    // Revoke refresh token trong DB
    if (refreshToken) {
      await authRepository.revokeRefreshToken(refreshToken);
    }

    return true;
  },

  // --------------------
  // ĐĂNG XUẤT TẤT CẢ THIẾT BỊ
  // --------------------
  async logoutAll(userId, ACCESS_TOKEN) {
    try {
      const decoded = jwt.decode(ACCESS_TOKEN);
      if (decoded?.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) await cache.blacklistToken(ACCESS_TOKEN, ttl);
      }
    } catch {}
    await authRepository.revokeAllUserTokens(userId);
    return true;
  },

  // --------------------
  // QUÊN MẬT KHẨU
  // --------------------
  async forgotPassword(email) {
    const user = await authRepository.findUserByEmail(email);
    // Không tiết lộ email có tồn tại hay không
    if (!user) return true;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = addMinutes(new Date(), 30);

    await authRepository.savePasswordResetToken(user.id, hashedToken, expiresAt);

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await sendMail({
      to: user.email,
      subject: 'Đặt lại mật khẩu - Phòng Khám',
      html: `
        <h2>Xin chào ${user.full_name},</h2>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn vào link bên dưới:</p>
        <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin:16px 0;">
          Đặt lại mật khẩu
        </a>
        <p>Link có hiệu lực trong <strong>30 phút</strong>.</p>
        <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
      `,
    });

    return true;
  },

  // --------------------
  // ĐẶT LẠI MẬT KHẨU
  // --------------------
  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await authRepository.findUserByResetToken(hashedToken);
    if (!user) throw new AppError('Token không hợp lệ hoặc đã hết hạn', 400);

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await userRepository.update(user.id, { password_hash: passwordHash });
    await authRepository.clearPasswordResetToken(user.id);
    await authRepository.revokeAllUserTokens(user.id);

    return true;
  },

  // --------------------
  // ĐỔI MẬT KHẨU
  // --------------------
  async changePassword(userId, currentPassword, newPassword) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new AppError('Người dùng không tồn tại', 404);

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) throw new AppError('Mật khẩu hiện tại không đúng', 400);

    if (currentPassword === newPassword) {
      throw new AppError('Mật khẩu mới không được trùng mật khẩu hiện tại', 400);
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await userRepository.update(userId, { password_hash: passwordHash });

    // Revoke tất cả refresh tokens (bắt đăng nhập lại)
    await authRepository.revokeAllUserTokens(userId);

    return true;
  },
};

module.exports = authService;
