const router = require('express').Router();
const blogController = require('./blog.controller');
const { authenticate, optionalAuth } = require('../../middlewares/auth.middleware');
const { isAdmin, isAdminOrDoctor } = require('../../middlewares/role.middleware');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const upload = multer({
  dest: 'uploads/temp/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(allowed.includes(file.mimetype) ? null : new Error('Chỉ hỗ trợ JPG, PNG, WebP'), allowed.includes(file.mimetype));
  },
});

// Public routes
router.get('/categories', blogController.getCategories);
router.get('/slug/:slug', optionalAuth, blogController.getBySlug);
router.get('/', optionalAuth, blogController.getAll);
router.get('/:id', optionalAuth, blogController.getById);

// Protected routes
router.use(authenticate);
router.post('/', isAdminOrDoctor, blogController.create);
router.put('/:id', isAdminOrDoctor, blogController.update);
router.post('/:id/thumbnail', isAdminOrDoctor, upload.single('thumbnail'), blogController.uploadThumbnail);
router.delete('/:id', isAdminOrDoctor, blogController.delete);

// Categories — Admin only
router.post('/categories', isAdmin, blogController.createCategory);
router.put('/categories/:id', isAdmin, blogController.updateCategory);
router.delete('/categories/:id', isAdmin, blogController.deleteCategory);

module.exports = router;
