const router = require('express').Router();
const authController = require('./auth.controller');
const {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
} = require('./auth.validation');
const { validate } = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');
const { authLimiter } = require('../../middlewares/rateLimiter.middleware');

// Public routes
router.post('/register', authLimiter, registerValidation, validate, authController.register);
router.post('/verify-email', verifyEmailValidation, validate, authController.verifyEmail);
router.post('/resend-verify', authLimiter, authController.resendVerifyEmail);
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authLimiter, forgotPasswordValidation, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword);

// Protected routes
router.use(authenticate);
router.get('/me', authController.getMe);
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);
router.put('/change-password', changePasswordValidation, validate, authController.changePassword);

module.exports = router;
