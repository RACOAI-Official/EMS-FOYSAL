const router = require('express').Router();
const User = require('../models/user-model');
const userController = require('../controllers/user-controller');
const asyncMiddleware = require('../middlewares/async-middleware');

// Get employees and teams for dropdown based on requester role
router.get('/', asyncMiddleware(async (req, res, next) => {
  let query = {
    type: { $in: ['employer', 'team', 'employee', 'leader'] },
    status: { $in: ['active', 'deactive'] }
  };

  // If requester is a leader, only show members of their team
  if (req.user && req.user.type === 'leader') {
    const Team = require('../models/team-model');
    const teams = await Team.find({ leader: req.user._id });
    const teamIds = teams.map(t => t._id);
    query = {
      team: { $in: teamIds },
      status: { $in: ['active', 'deactive'] },
      type: { $in: ['employee', 'leader'] } // Can assign to other leaders in team or employees
    };
  }

  const users = await User.find(query).select('name type email');
  res.json(users);
}));

router.get('/search', asyncMiddleware(userController.globalSearch.bind(userController)));
router.get('/leaderboard-data', asyncMiddleware(userController.getLeaderboardData));
router.get('/:id', asyncMiddleware(userController.getUserNoFilter));

module.exports = router;
