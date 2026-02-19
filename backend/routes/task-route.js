const router = require('express').Router();
const taskController = require('../controllers/task-controller');
const { auth, authRole } = require('../middlewares/auth-middleware');
const asyncMiddleware = require('../middlewares/async-middleware');
const upload = require('../middlewares/multer-cloudinary-config');

router.post('/admin', auth, authRole(['super_admin', 'sub_admin', 'leader']), upload.single('taskFile'), asyncMiddleware(taskController.createTask));
router.get('/admin', auth, authRole(['super_admin', 'sub_admin']), asyncMiddleware(taskController.getAdminTasks));
router.get('/leader', auth, authRole(['leader']), asyncMiddleware(taskController.getLeaderTasks));
router.delete('/admin/:id', auth, authRole(['super_admin', 'sub_admin']), asyncMiddleware(taskController.softDeleteTask));
router.get('/:id/pdf', auth, asyncMiddleware(taskController.downloadPDF));

router.get('/user', auth, asyncMiddleware(taskController.getUserTasks));
router.patch('/:id/progress', auth, asyncMiddleware(taskController.updateTaskProgress));

module.exports = router;
