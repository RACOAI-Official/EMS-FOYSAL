const router = require('express').Router();
const asyncMiddleware = require('../middlewares/async-middleware');
const userController = require('../controllers/user-controller');
const teamController = require('../controllers/team-controller');
const leaderController = require('../controllers/leader-controller');
const progressController = require('../controllers/progress-controller');
const upload = require('../services/file-upload-service');

router.patch('/user', upload.single('profile'), asyncMiddleware(userController.updateUser));      // Update Self Profile
router.get('/team', asyncMiddleware(leaderController.getTeam));                                  // Team
router.get('/team/members', asyncMiddleware(leaderController.getTeamMembers));
router.get('/stats', asyncMiddleware(leaderController.getDashboardStats));
// Team Members

// Progress updates
router.patch('/team/progress', asyncMiddleware(async (req, res, next) => {
    // Leader updates their own team's progress
    const teamService = require('../services/team-service');
    const ErrorHandler = require('../utils/error-handler');
    const mongoose = require('mongoose');
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

// Progress (self only)
router.post('/progress', asyncMiddleware(progressController.submitSelfProgress));
router.get('/progress', asyncMiddleware(progressController.getSelfProgress));

// Member Progress
router.patch('/progress/member/:id', async (req, res, next) => {
    const { id } = req.params;
    const Team = require('../models/team-model');
    const User = require('../models/user-model');
    const ErrorHandler = require('../utils/error-handler');

    try {
        // Find leader's team
        const team = await Team.findOne({ leader: req.user._id });
        if (!team) return next(ErrorHandler.notFound('You are not leading any team'));

        // Verify target user is in leader's team
        const member = await User.findById(id);
        if (!member || !member.team.includes(team._id)) {
            return next(ErrorHandler.unauthorized('You can only update progress for your own team members'));
        }

        // Proceed to controller
        return userController.updateUserProgress(req, res, next);
    } catch (err) {
        next(err);
    }
});

// Attendance summary (self)
router.get('/attendance-summary', asyncMiddleware(userController.getAttendanceSummary));


module.exports = router;
