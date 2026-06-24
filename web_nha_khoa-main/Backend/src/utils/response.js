/**
 * Chuẩn hóa response API cho toàn bộ hệ thống phòng khám
 */

const successResponse = (res, { message = 'Thành công', data = null, meta = null, statusCode = 200 } = {}) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  if (meta !== null) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

const createdResponse = (res, { message = 'Tạo thành công', data = null } = {}) => {
  return successResponse(res, { message, data, statusCode: 201 });
};

const errorResponse = (res, { message = 'Có lỗi xảy ra', errors = null, statusCode = 500 } = {}) => {
  const payload = { success: false, message };
  if (errors !== null) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

const paginatedResponse = (res, { message = 'Thành công', data, page, limit, total }) => {
  return successResponse(res, {
    message,
    data,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

const notFoundResponse = (res, message = 'Không tìm thấy dữ liệu') => {
  return errorResponse(res, { message, statusCode: 404 });
};

const unauthorizedResponse = (res, message = 'Chưa xác thực, vui lòng đăng nhập') => {
  return errorResponse(res, { message, statusCode: 401 });
};

const forbiddenResponse = (res, message = 'Bạn không có quyền thực hiện thao tác này') => {
  return errorResponse(res, { message, statusCode: 403 });
};

const badRequestResponse = (res, { message = 'Dữ liệu không hợp lệ', errors = null } = {}) => {
  return errorResponse(res, { message, errors, statusCode: 400 });
};

const conflictResponse = (res, message = 'Dữ liệu đã tồn tại') => {
  return errorResponse(res, { message, statusCode: 409 });
};

module.exports = {
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
  conflictResponse,
};
