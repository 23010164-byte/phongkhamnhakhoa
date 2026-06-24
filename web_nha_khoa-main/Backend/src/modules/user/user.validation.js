const { body, param } = require('express-validator');
const { ROLES, GENDER } = require('../../utils/constants');

const updateProfileValidation = [
  body('fullName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Họ tên từ 2-100 ký tự'),
  body('phone').optional().matches(/^[0-9+\s()-]{8,20}$/).withMessage('Số điện thoại không hợp lệ (từ 8 đến 20 số)'),
  body('gender').optional().isIn(Object.values(GENDER)).withMessage('Giới tính không hợp lệ'),
  body('dateOfBirth').optional().isDate().withMessage('Ngày sinh không hợp lệ'),
  body('address').optional().trim().isLength({ max: 500 }).withMessage('Địa chỉ tối đa 500 ký tự'),
  body('bloodType').optional().isIn(['A', 'B', 'AB', 'O', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Nhóm máu không hợp lệ'),
  body('emergencyContactPhone').optional().matches(/^[0-9+\s()-]{8,20}$/).withMessage('SĐT liên hệ khẩn cấp không hợp lệ (từ 8 đến 20 số)'),
];

const createUserValidation = [
  body('fullName').trim().notEmpty().withMessage('Họ tên không được để trống').isLength({ min: 2, max: 100 }),
  body('email').trim().notEmpty().isEmail().withMessage('Email không hợp lệ'),
  body('phone').optional().matches(/^[0-9+\s()-]{8,20}$/).withMessage('Số điện thoại không hợp lệ (từ 8 đến 20 số)'),
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 8 }).withMessage('Mật khẩu tối thiểu 8 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt'),
  body('role').optional().isIn(Object.values(ROLES)).withMessage('Role không hợp lệ'),
  body('gender').optional().isIn(Object.values(GENDER)).withMessage('Giới tính không hợp lệ'),
];

const userIdValidation = [
  param('id').isUUID().withMessage('ID người dùng không hợp lệ'),
];

module.exports = { updateProfileValidation, createUserValidation, userIdValidation };
