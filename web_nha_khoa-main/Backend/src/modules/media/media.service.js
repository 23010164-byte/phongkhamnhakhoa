const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cloudinary = require('../../config/cloudinary');
const Media = require('./media.model');
const { AppError } = require('../../middlewares/error.middleware');
const { getPagination } = require('../../utils/helpers');
const { MEDIA_TYPE, ALLOWED_IMAGE_TYPES, ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZE, ROLES } = require('../../utils/constants');
const logger = require('../../utils/logger');

// ========================
// MULTER CONFIG
// ========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tmpDir = path.join(process.cwd(), 'uploads', 'temp');
    fs.mkdirSync(tmpDir, { recursive: true });
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Loại file không được hỗ trợ. Cho phép: ${allowedTypes.join(', ')}`, 400), false);
  }
};

const uploadImageMiddleware = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
});

const uploadDocumentMiddleware = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter(ALLOWED_DOCUMENT_TYPES),
});

// ========================
// CLOUDINARY UPLOAD HELPER
// ========================
const uploadToCloudinary = async (filePath, folder, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `clinic/${folder}`,
      quality: 'auto',
      fetch_format: 'auto',
      ...options,
    });
    return result;
  } finally {
    // Xóa file tạm sau khi upload
    fs.unlink(filePath, () => {});
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    logger.warn(`Xóa Cloudinary thất bại [${publicId}]:`, err.message);
  }
};

// ========================
// MEDIA SERVICE
// ========================
const mediaService = {
  // --------------------
  // UPLOAD SINGLE IMAGE
  // --------------------
  async uploadImage(file, userId, { refId, refType, type = MEDIA_TYPE.DOCUMENT } = {}) {
    if (!file) throw new AppError('Không có file được tải lên', 400);

    const folder = type === MEDIA_TYPE.AVATAR ? 'avatars' :
                   type === MEDIA_TYPE.BLOG ? 'blogs' : 'documents';

    const cloudOpts = type === MEDIA_TYPE.AVATAR
      ? { width: 400, height: 400, crop: 'fill', format: 'webp' }
      : {};

    const result = await uploadToCloudinary(file.path, folder, cloudOpts);

    const media = await Media.create({
      user_id: userId,
      ref_id: refId || null,
      ref_type: refType || null,
      type,
      original_name: file.originalname,
      url: result.secure_url,
      public_id: result.public_id,
      mime_type: file.mimetype,
      size: result.bytes,
      width: result.width || null,
      height: result.height || null,
    });

    return media;
  },

  // --------------------
  // UPLOAD MULTIPLE FILES
  // --------------------
  async uploadMultiple(files, userId, { refId, refType, type = MEDIA_TYPE.DOCUMENT } = {}) {
    if (!files?.length) throw new AppError('Không có file được tải lên', 400);

    const results = await Promise.all(
      files.map((file) => this.uploadImage(file, userId, { refId, refType, type }))
    );

    return results;
  },

  // --------------------
  // UPLOAD KẾT QUẢ XÉT NGHIỆM / HỒ SƠ BỆNH ÁN
  // --------------------
  async uploadMedicalDocument(file, userId, { refId, refType } = {}) {
    if (!file) throw new AppError('Không có file được tải lên', 400);

    // PDF và ảnh đều được chấp nhận
    let result;
    if (file.mimetype === 'application/pdf') {
      result = await uploadToCloudinary(file.path, 'medical', {
        resource_type: 'raw',
        format: 'pdf',
      });
    } else {
      result = await uploadToCloudinary(file.path, 'medical');
    }

    const media = await Media.create({
      user_id: userId,
      ref_id: refId || null,
      ref_type: refType || null,
      type: MEDIA_TYPE.RESULT,
      original_name: file.originalname,
      url: result.secure_url,
      public_id: result.public_id,
      mime_type: file.mimetype,
      size: result.bytes || file.size,
    });

    return media;
  },

  // --------------------
  // DANH SÁCH MEDIA CỦA USER
  // --------------------
  async getMyMedia(userId, query) {
    const { page, limit, offset } = getPagination(query);
    const { type, refId, refType } = query;

    const where = { user_id: userId };
    if (type) where.type = type;
    if (refId) where.ref_id = refId;
    if (refType) where.ref_type = refType;

    const { count, rows } = await Media.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return { total: count, media: rows };
  },

  // Lấy media theo ref (appointment, medical_record...)
  async getByRef(refId, refType) {
    return Media.findAll({
      where: { ref_id: refId, ref_type: refType },
      order: [['created_at', 'ASC']],
    });
  },

  // --------------------
  // XÓA FILE
  // --------------------
  async delete(id, requestUser) {
    const media = await Media.findByPk(id);
    if (!media) throw new AppError('Không tìm thấy file', 404);

    // Chỉ owner hoặc admin được xóa
    if (requestUser.role !== ROLES.ADMIN && media.user_id !== requestUser.id) {
      throw new AppError('Bạn không có quyền xóa file này', 403);
    }

    // Xóa trên Cloudinary
    if (media.public_id) {
      const resourceType = media.mime_type === 'application/pdf' ? 'raw' : 'image';
      await cloudinary.uploader.destroy(media.public_id, { resource_type: resourceType })
        .catch((err) => logger.warn('Xóa Cloudinary thất bại:', err.message));
    }

    await media.destroy();
    return true;
  },
};

module.exports = { mediaService, uploadImageMiddleware, uploadDocumentMiddleware };
