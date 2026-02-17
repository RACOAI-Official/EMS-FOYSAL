const router = require('express').Router();
const problemController = require('../controllers/problem-controller');
const asyncMiddleware = require('../middlewares/async-middleware');
const { auth, authRole } = require('../middlewares/auth-middleware');
const upload = require('../middlewares/multer-cloudinary-config');

router.post('/submit', auth, upload.single('image'), asyncMiddleware(problemController.submitProblem));
router.get('/my-problems', auth, asyncMiddleware(problemController.getUserProblems));
router.get('/leader-problems', auth, authRole(['leader']), asyncMiddleware(problemController.getScopedProblems));
router.get('/all', auth, authRole(['super_admin', 'sub_admin']), asyncMiddleware(problemController.getAllProblems));
router.patch('/status/:id', auth, authRole(['super_admin', 'sub_admin']), asyncMiddleware(problemController.updateProblemStatus));
router.patch('/solution/:id', auth, authRole(['super_admin', 'sub_admin', 'leader']), asyncMiddleware(problemController.provideSolution));
router.delete('/:id', auth, authRole(['super_admin', 'sub_admin']), asyncMiddleware(problemController.deleteProblem));
router.get('/:id', auth, asyncMiddleware(problemController.getProblem));

module.exports = router;
