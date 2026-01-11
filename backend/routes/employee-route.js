const router = require('express').Router();
const asyncMiddleware = require('../middlewares/async-middleware');
const userController = require('../controllers/user-controller');
const teamController = require('../controllers/team-controller');
const progressController = require('../controllers/progress-controller');
const upload = require('../services/file-upload-service');

router.patch('/user',upload.single('profile'),asyncMiddleware(userController.updateUser));  // Update Self Account
router.get('/team/:id',asyncMiddleware(teamController.getTeam));
router.get('/team/:id/members',asyncMiddleware(teamController.getTeamMembers)); 
router.post('/mark-employee-attendance',asyncMiddleware(userController.markEmployeeAttendance));
router.post('/mark-employee-checkout',asyncMiddleware(userController.markEmployeeCheckOut));
router.post('/view-employee-attendance',asyncMiddleware(userController.viewEmployeeAttendance));
router.post('/apply-leave-application',asyncMiddleware(userController.applyLeaveApplication));
router.post('/view-leave-applications',asyncMiddleware(userController.viewLeaveApplications));
router.post('/view-salary',asyncMiddleware(userController.viewSalary));

// Progress (self only)
router.post('/progress', asyncMiddleware(progressController.submitSelfProgress));
router.get('/progress', asyncMiddleware(progressController.getSelfProgress));

module.exports = router;