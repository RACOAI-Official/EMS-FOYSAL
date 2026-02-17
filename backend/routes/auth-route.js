const router = require('express').Router();
const authController = require('../controllers/auth-controller');
const { auth } = require('../middlewares/auth-middleware');
const upload = require('../middlewares/multer-cloudinary-config');

router.post('/login', authController.login);
router.post('/forgot', authController.forgot);
router.patch('/reset', authController.reset);
router.get('/logout', auth, authController.logout);
router.get('/refresh', authController.refresh);
router.post('/register-invited', upload.single('image'), authController.registerInvited);

module.exports = router;

