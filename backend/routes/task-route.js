const router = require('express').Router();
const taskController = require('../controllers/task-controller');
const { authRole } = require('../middlewares/auth-middleware');
const asyncMiddleware = require('../middlewares/async-middleware');
const upload = require('../services/file-upload-service');

// ADMIN & LEADER ROUTES
router.post('/admin', authRole(['super_admin', 'sub_admin', 'leader']), upload.single('taskFile'), asyncMiddleware(taskController.createTask));
router.get('/admin', authRole(['super_admin', 'sub_admin']), asyncMiddleware(taskController.getAdminTasks));
router.get('/leader', authRole(['leader']), asyncMiddleware(taskController.getLeaderTasks));
router.delete('/admin/:id', authRole(['super_admin', 'sub_admin']), asyncMiddleware(taskController.softDeleteTask));
router.get('/:id/pdf', asyncMiddleware(taskController.downloadPDF));

// USER ROUTES
router.get('/user', asyncMiddleware(taskController.getUserTasks));
router.patch('/:id/progress', asyncMiddleware(taskController.updateTaskProgress));

module.exports = router;
