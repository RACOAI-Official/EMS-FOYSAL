const router = require('express').Router();
const invitationController = require('../controllers/invitation-controller');
const { auth, authRole } = require('../middlewares/auth-middleware');

router.post('/invite', auth, authRole(['super_admin', 'sub_admin']), invitationController.inviteUser);
router.get('/verify/:token', invitationController.verifyInvitation);

module.exports = router;
