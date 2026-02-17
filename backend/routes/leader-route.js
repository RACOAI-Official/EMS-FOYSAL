const router = require('express').Router();
const asyncMiddleware = require('../middlewares/async-middleware');
const userController = require('../controllers/user-controller');
const teamController = require('../controllers/team-controller');
const leaderController = require('../controllers/leader-controller');
const progressController = require('../controllers/progress-controller');
const upload = require('../middlewares/multer-cloudinary-config');
const { auth } = require('../middlewares/auth-middleware');

router.use(auth);

router.patch('/user', upload.single('image'), asyncMiddleware(userController.updateUser));
router.get('/team', asyncMiddleware(leaderController.getTeam));
router.get('/team/members', asyncMiddleware(leaderController.getTeamMembers));
router.get('/stats', asyncMiddleware(leaderController.getDashboardStats));
router.get('/leaderboard', asyncMiddleware(leaderController.getLeaderboard));

router.patch('/team/progress', asyncMiddleware(async (req, res, next) => {
    const teamService = require('../services/team-service');
    const ErrorHandler = require('../utils/error-handler');
    try {
        const { progress, progressNote } = req.body;
        const team = await teamService.findTeam({ leader: req.user._id });
        if (!team) return next(ErrorHandler.notFound('You are not leading any team'));
        let p = Number(progress);
        if (progress === undefined || progress === null) return next(ErrorHandler.badRequest('Progress value is required'));
        if (Number.isNaN(p) || p < 0 || p > 100) return next(ErrorHandler.badRequest('Progress must be a number between 0 and 100'));
        const update = { progress: p };
        if (typeof progressNote === 'string') update.progressNote = progressNote;
        const result = await teamService.updateTeam(team._id, update);
        return (result.modifiedCount !== 1)
            ? next(ErrorHandler.serverError('Failed To Update Team Progress'))
            : res.json({ success: true, message: 'Team progress updated' });
    } catch (error) {
        return next(error);
    }
}));

router.post('/progress', asyncMiddleware(progressController.submitSelfProgress));
router.get('/progress', asyncMiddleware(progressController.getSelfProgress));

router.patch('/progress/member/:id', async (req, res, next) => {
    const { id } = req.params;
    const Team = require('../models/team-model');
    const User = require('../models/user-model');
    const ErrorHandler = require('../utils/error-handler');

    try {
        const team = await Team.findOne({ leader: req.user._id });
        if (!team) return next(ErrorHandler.notFound('You are not leading any team'));
        const member = await User.findById(id);
        if (!member || !member.team.includes(team._id)) {
            return next(ErrorHandler.unauthorized('You can only update progress for your own team members'));
        }
        return userController.updateUserProgress(req, res, next);
    } catch (err) {
        next(err);
    }
});

router.get('/attendance-summary', asyncMiddleware(userController.getAttendanceSummary));

module.exports = router;
