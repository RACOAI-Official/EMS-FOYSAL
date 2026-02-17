const express = require('express');
const router = express.Router();
const asyncMiddleware = require('../middlewares/async-middleware');
const userController = require('../controllers/user-controller');
const upload = require('../middlewares/multer-cloudinary-config');
const { auth } = require('../middlewares/auth-middleware');

router.post('/create', upload.single('image'), asyncMiddleware(userController.createUser));
router.patch('/update-self', auth, upload.single('image'), asyncMiddleware(userController.updateUser));
router.patch('/:id', auth, upload.single('image'), asyncMiddleware(userController.updateUser));

module.exports = router;
