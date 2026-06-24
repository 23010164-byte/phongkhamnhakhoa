const router = require('express').Router();
const userController = require('./user.controller');
const { updateProfileValidation, createUserValidation, userIdValidation } = require('./user.validation');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { isAdmin, isAdminOrReceptionist } = require('../../middlewares/role.middleware');
const multer = require('multer');

const upload = multer({ dest: 'uploads/temp/', limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authenticate);

// Profile cá nhân
router.get('/profile', userController.getProfile);
router.put('/profile', updateProfileValidation, validate, userController.updateProfile);
router.put('/profile/avatar', upload.single('avatar'), userController.updateAvatar);

// Admin: quản lý users
router.get('/', isAdmin, userController.getAllUsers);
router.post('/', isAdminOrReceptionist, createUserValidation, validate, userController.createUser);
router.get('/patients', isAdminOrReceptionist, userController.getPatients);
router.get('/:id', isAdmin, userIdValidation, validate, userController.getUserById);
router.put('/:id', isAdmin, userIdValidation, validate, userController.updateUser);
router.patch('/:id/toggle-active', isAdmin, userIdValidation, validate, userController.toggleUserActive);
router.delete('/:id', isAdmin, userIdValidation, validate, userController.deleteUser);

module.exports = router;
