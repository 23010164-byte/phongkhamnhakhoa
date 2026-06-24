const { ROLES } = require('../utils/constants');
const { forbiddenResponse } = require('../utils/response');

/**
 * Kiểm tra role của user
 * @param  {...string} allowedRoles - Danh sách role được phép
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return forbiddenResponse(res, 'Chưa xác thực người dùng');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return forbiddenResponse(
        res,
        `Bạn không có quyền truy cập. Yêu cầu: [${allowedRoles.join(', ')}]`
      );
    }

    next();
  };
};

// Shorthand middleware cho từng role
const isAdmin = authorize(ROLES.ADMIN);
const isDoctor = authorize(ROLES.DOCTOR);
const isReceptionist = authorize(ROLES.RECEPTIONIST);
const isPatient = authorize(ROLES.PATIENT);

const isAdminOrDoctor = authorize(ROLES.ADMIN, ROLES.DOCTOR);
const isAdminOrReceptionist = authorize(ROLES.ADMIN, ROLES.RECEPTIONIST);
const isStaff = authorize(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST);
const isDoctorOrReceptionist = authorize(ROLES.DOCTOR, ROLES.RECEPTIONIST);

/**
 * Cho phép chủ sở hữu resource HOẶC các role được chỉ định
 * Dùng khi user được phép chỉnh sửa resource của chính mình
 * @param {function} getResourceOwnerId - Hàm lấy ownerId từ req
 * @param  {...string} allowedRoles - Role bỏ qua kiểm tra owner
 */
const authorizeOwnerOrRoles = (getResourceOwnerId, ...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return forbiddenResponse(res, 'Chưa xác thực người dùng');
      }

      // Admin bypass tất cả
      if (req.user.role === ROLES.ADMIN) return next();

      // Nếu có role phù hợp
      if (allowedRoles.includes(req.user.role)) return next();

      // Kiểm tra owner
      const ownerId = await getResourceOwnerId(req);
      if (ownerId && String(ownerId) === String(req.user.id)) {
        return next();
      }

      return forbiddenResponse(res, 'Bạn không có quyền thực hiện thao tác này');
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authorize,
  isAdmin,
  isDoctor,
  isReceptionist,
  isPatient,
  isAdminOrDoctor,
  isAdminOrReceptionist,
  isStaff,
  isDoctorOrReceptionist,
  authorizeOwnerOrRoles,
};
