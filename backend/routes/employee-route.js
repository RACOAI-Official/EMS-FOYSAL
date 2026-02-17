const router = require('express').Router();
const asyncMiddleware = require('../middlewares/async-middleware');
const teamController = require('../controllers/team-controller');
const progressController = require('../controllers/progress-controller');
const { auth } = require('../middlewares/auth-middleware');
const upload = require('../middlewares/multer-cloudinary-config');
const userController = require('../controllers/user-controller');

/**
 * =====================
 * USER ROUTES
 * =====================
 */
router.patch('/user', auth, upload.single('image'), asyncMiddleware(userController.updateUser));

// Attendance
router.post('/attendance/mark', asyncMiddleware(userController.markEmployeeAttendance));
router.post('/attendance/checkout', asyncMiddleware(userController.markEmployeeCheckOut));
router.post('/attendance/view', asyncMiddleware(userController.viewEmployeeAttendance));
router.get('/attendance/summary', auth, asyncMiddleware(userController.getAttendanceSummary));

// Leave Applications
router.post('/leave/apply', asyncMiddleware(userController.applyLeaveApplication));
router.post('/leave/view', asyncMiddleware(userController.viewLeaveApplications));

// Salary
router.post('/salary/view', asyncMiddleware(userController.viewSalary));

/**
 * =====================
 * TEAM ROUTES
 * =====================
 */
router.get('/team/:id', asyncMiddleware(teamController.getTeam));
router.get('/team/:id/members', asyncMiddleware(teamController.getTeamMembers));

/**
 * =====================
 * PROGRESS ROUTES
 * =====================
 */
router.post('/progress', asyncMiddleware(progressController.submitSelfProgress));
router.get('/progress', auth, asyncMiddleware(progressController.getSelfProgress));

module.exports = router;
