const router = require('express').Router();
const userController = require('../controllers/user-controller');
const teamController = require('../controllers/team-controller');
const holidayController = require('../controllers/holiday-controller');
const progressController = require('../controllers/progress-controller');
const upload = require('../middlewares/multer-cloudinary-config');
const asyncMiddleware = require('../middlewares/async-middleware');
const { auth, authRole } = require('../middlewares/auth-middleware');

router.post('/user', upload.single('image'), asyncMiddleware(userController.createUser));
router.patch('/user/:id', upload.single('image'), asyncMiddleware(userController.updateUser));
router.delete('/user/:id', asyncMiddleware(userController.deleteUser));
router.get('/employees', asyncMiddleware(userController.getUsers));
router.get('/employees/free', asyncMiddleware(userController.getFreeEmployees));
router.get('/employee/:id', asyncMiddleware(userController.getUser));
router.get('/user/:id', asyncMiddleware(userController.getUserNoFilter));
router.get('/admins', asyncMiddleware(userController.getUsers));
router.get('/admin/:id', asyncMiddleware(userController.getUser));
router.get('/leaders/free', asyncMiddleware(userController.getFreeLeaders));
router.get('/leaders', asyncMiddleware(userController.getLeaders));
router.get('/leader/:id', asyncMiddleware(userController.getUser));
router.post('/team', upload.single('image'), asyncMiddleware(teamController.createTeam));
router.patch('/team/:id', upload.single('image'), asyncMiddleware(teamController.updateTeam));
router.patch('/team/:id/progress', asyncMiddleware(teamController.updateTeamProgress));
router.get('/teams', asyncMiddleware(teamController.getTeams));
router.get('/team/:id', asyncMiddleware(teamController.getTeam));
router.delete('/team/:id', asyncMiddleware(teamController.deleteTeam));
router.get('/team/:id/members', asyncMiddleware(teamController.getTeamMembers));
router.patch('/team/member/add', asyncMiddleware(teamController.addMember));
router.patch('/team/member/remove', asyncMiddleware(teamController.removeMember));
router.patch('/team/leader/add', asyncMiddleware(teamController.addRemoveLeader));
router.patch('/team/leader/remove', asyncMiddleware(teamController.addRemoveLeader));
router.get('/counts', asyncMiddleware(teamController.getCounts));

router.get('/users/by-type/:type', asyncMiddleware(userController.getUsersByType));
router.get('/users/type/admin', asyncMiddleware(userController.getAdminUsers));
router.get('/users/type/leader', asyncMiddleware(userController.getLeaderUsers));
router.get('/users/type/employee', asyncMiddleware(userController.getEmployeeUsers));

router.post('/view-employee-attendance', asyncMiddleware(userController.viewEmployeeAttendance));
router.post('/view-leave-applications', asyncMiddleware(userController.viewLeaveApplications));
router.post('/assign-employee-salary', asyncMiddleware(userController.assignEmployeeSalary));
router.post('/update-employee-salary/', asyncMiddleware(userController.updateEmployeeSalary));
router.post('/view-all-salary', asyncMiddleware(userController.viewSalary));
router.post('/update-leave/:id', asyncMiddleware(userController.updateLeaveApplication));
router.delete('/delete-leave/:id', asyncMiddleware(userController.deleteLeaveApplication));
router.delete('/delete-salary/:id', asyncMiddleware(userController.deleteSalary));

router.get('/attendance-summary/:userId', auth, authRole(['super_admin', 'sub_admin']), asyncMiddleware(userController.getAttendanceSummary));
router.patch('/attendance/:id', asyncMiddleware(userController.editAttendance));
router.patch('/user/:id/progress', asyncMiddleware(userController.updateUserProgress));
router.post('/recalculate-salary/:userId', asyncMiddleware(userController.recalculateSalary));

router.get('/progress', auth, authRole(['super_admin', 'sub_admin']), asyncMiddleware(progressController.getAllProgress));

router.post('/holidays', asyncMiddleware(holidayController.createHoliday));
router.get('/holidays', asyncMiddleware(holidayController.getHolidays));
router.delete('/holidays/:id', asyncMiddleware(holidayController.deleteHoliday));

module.exports = router;
