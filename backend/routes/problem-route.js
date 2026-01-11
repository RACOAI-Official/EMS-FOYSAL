const router = require('express').Router();
const problemController = require('../controllers/problem-controller');
const asyncMiddleware = require('../middlewares/async-middleware');
const { auth, authRole } = require('../middlewares/auth-middleware');

const upload = require('../services/file-upload-service');

// User routes
router.post('/submit', auth, upload.single('problemImage'), asyncMiddleware(problemController.submitProblem));
router.get('/my-problems', auth, asyncMiddleware(problemController.getUserProblems));

// Leader routes
router.get('/leader-problems', auth, authRole(['leader']), asyncMiddleware(problemController.getScopedProblems));

// Admin routes
router.get('/all', auth, authRole(['admin']), asyncMiddleware(problemController.getAllProblems));
router.patch('/status/:id', auth, authRole(['admin']), asyncMiddleware(problemController.updateProblemStatus));
router.patch('/solution/:id', auth, authRole(['admin']), asyncMiddleware(problemController.provideSolution));
router.get('/:id', auth, asyncMiddleware(problemController.getProblem));

module.exports = router;
