const router = require('express').Router();
const asyncMiddleware = require('../middlewares/async-middleware');
const employerController = require('../controllers/employer-controller');
const { auth, authRole } = require('../middlewares/auth-middleware');

// Employer (Empire) management
router.get('/', auth, authRole(['super_admin', 'sub_admin']), asyncMiddleware(employerController.getEmpires));
router.post('/', auth, authRole(['super_admin', 'sub_admin']), asyncMiddleware(employerController.createEmpire));
router.patch('/:id', auth, authRole(['super_admin', 'sub_admin']), asyncMiddleware(employerController.updateEmpire));
router.delete('/:id', auth, authRole(['super_admin', 'sub_admin']), asyncMiddleware(employerController.deleteEmpire));

module.exports = router;
