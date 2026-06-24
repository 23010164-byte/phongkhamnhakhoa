const router = require('express').Router();
const mediaController = require('./media.controller');
const { mediaService, uploadImageMiddleware, uploadDocumentMiddleware } = require('./media.service');
const { authenticate } = require('../../middlewares/auth.middleware');
const { uploadLimiter } = require('../../middlewares/rateLimiter.middleware');

router.use(authenticate);
router.use(uploadLimiter);

router.get('/', mediaController.getMyMedia);
router.get('/by-ref', mediaController.getByRef);

router.post(
  '/image',
  uploadImageMiddleware.single('file'),
  mediaController.uploadImage
);

router.post(
  '/images',
  uploadImageMiddleware.array('files', 5),
  mediaController.uploadMultiple
);

router.post(
  '/medical-document',
  uploadDocumentMiddleware.single('file'),
  mediaController.uploadMedicalDocument
);

router.delete('/:id', mediaController.delete);

module.exports = router;
