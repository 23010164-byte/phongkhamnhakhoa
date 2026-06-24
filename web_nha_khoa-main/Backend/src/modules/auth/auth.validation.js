const { body } = require('express-validator');

const registerValidation = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Họ tên không được để trống')
    .isLength({ min: 2, max: 100 }).withMessage('Họ tên từ 2-100 ký tự'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('phone')
    .optional()
    .matches(/^[0-9+\s()-]{8,20}$/).withMessage('Số điện thoại không hợp lệ (từ 8 đến 20 số)'),

  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 8 }).withMessage('Mật khẩu tối thiểu 8 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other']).withMessage('Giới tính không hợp lệ'),

  body('dateOfBirth')
    .optional()
    .isDate().withMessage('Ngày sinh không hợp lệ')
    .custom((val) => {
      const dob = new Date(val);
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 120);
      const maxAge = new Date();
      if (dob < minAge) throw new Error('Ngày sinh không hợp lệ (không quá 120 tuổi)');
      if (dob > maxAge) throw new Error('Ngày sinh không được ở tương lai');
      return true;
    }),
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email không được để trống').isEmail().withMessage('Email không hợp lệ'),
  body('password').notEmpty().withMessage('Mật khẩu không được để trống'),
];

const verifyEmailValidation = [
  body('email').trim().notEmpty().isEmail().withMessage('Email không hợp lệ'),
  body('otp').trim().notEmpty().isLength({ min: 6, max: 6 }).withMessage('OTP phải có 6 chữ số').isNumeric().withMessage('OTP chỉ gồm số'),
];

const forgotPasswordValidation = [
  body('email').trim().notEmpty().isEmail().withMessage('Email không hợp lệ'),
];

const resetPasswordValidation = [
  body('token').trim().notEmpty().withMessage('Token không được để trống'),
  body('newPassword')
    .notEmpty().withMessage('Mật khẩu mới không được để trống')
    .isLength({ min: 8 }).withMessage('Mật khẩu tối thiểu 8 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Mật khẩu hiện tại không được để trống'),
  body('newPassword')
    .notEmpty().withMessage('Mật khẩu mới không được để trống')
    .isLength({ min: 8 }).withMessage('Mật khẩu tối thiểu 8 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt')
    .custom((val, { req }) => {
      if (val === req.body.currentPassword) throw new Error('Mật khẩu mới không được trùng mật khẩu hiện tại');
      return true;
    }),
];

module.exports = {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
};
