const authService = require('./auth.service');
const {
  successResponse,
  createdResponse,
  badRequestResponse,
} = require('../../utils/response');

const authController = {
  async register(req, res, next) {
    try {
      const { fullName, email, phone, password, gender, dateOfBirth } = req.body;
      const data = await authService.register({ fullName, email, phone, password, gender, dateOfBirth });
      return createdResponse(res, {
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async verifyEmail(req, res, next) {
    try {
      const { email, otp } = req.body;
      await authService.verifyEmail(email, otp);
      return successResponse(res, { message: 'Xác thực email thành công! Bạn có thể đăng nhập.' });
    } catch (error) {
      next(error);
    }
  },

  async resendVerifyEmail(req, res, next) {
    try {
      const { email } = req.body;
      await authService.resendVerifyEmail(email);
      return successResponse(res, { message: 'Đã gửi lại mã xác thực, vui lòng kiểm tra email.' });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];

      const data = await authService.login({ email, password, ipAddress, userAgent });

      // Gửi refresh token qua httpOnly cookie
      res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });

      return successResponse(res, {
        message: 'Đăng nhập thành công',
        data: {
          ACCESS_TOKEN: data.ACCESS_TOKEN,
          expiresIn: data.expiresIn,
          user: data.user,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async refreshToken(req, res, next) {
    try {
      // Lấy từ cookie hoặc body
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        return badRequestResponse(res, { message: 'Refresh token không được cung cấp' });
      }

      const data = await authService.refreshToken(token);

      res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return successResponse(res, {
        message: 'Làm mới token thành công',
        data: { ACCESS_TOKEN: data.ACCESS_TOKEN, expiresIn: data.expiresIn },
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      const ACCESS_TOKEN = req.token;
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      await authService.logout(ACCESS_TOKEN, refreshToken);

      res.clearCookie('refreshToken');
      return successResponse(res, { message: 'Đăng xuất thành công' });
    } catch (error) {
      next(error);
    }
  },

  async logoutAll(req, res, next) {
    try {
      await authService.logoutAll(req.user.id, req.token);
      res.clearCookie('refreshToken');
      return successResponse(res, { message: 'Đã đăng xuất khỏi tất cả thiết bị' });
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      return successResponse(res, {
        message: 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.',
      });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      return successResponse(res, { message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.' });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user.id, currentPassword, newPassword);
      res.clearCookie('refreshToken');
      return successResponse(res, { message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req, res, next) {
    try {
      const userRepository = require('../user/user.repository');
      const user = await userRepository.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      return successResponse(res, { data: user });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
