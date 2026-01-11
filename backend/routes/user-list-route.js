const router = require('express').Router();
const User = require('../models/user-model');
const asyncMiddleware = require('../middlewares/async-middleware');

// Get employers and teams for dropdown
router.get('/', asyncMiddleware(async (req, res, next) => {
  const users = await User.find({
    type: { $in: ['employer', 'team', 'employee', 'leader'] },
    status: 'active'
  }).select('name type email');

  res.json(users);
}));

module.exports = router;
