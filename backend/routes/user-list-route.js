const router = require('express').Router();
const User = require('../models/user-model');
const userController = require('../controllers/user-controller');
const asyncMiddleware = require('../middlewares/async-middleware');

// Get employees and teams for dropdown based on requester role
router.get('/', asyncMiddleware(userController.getUserListData));

router.get('/search', asyncMiddleware(userController.globalSearch.bind(userController)));
router.get('/leaderboard-data', asyncMiddleware(userController.getLeaderboardData));
router.get('/:id', asyncMiddleware(userController.getUserNoFilter));

module.exports = router;
