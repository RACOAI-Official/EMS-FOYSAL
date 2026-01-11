const router = require('express').Router();
const employerController = require('../controllers/employer-controller');

router.post('/', employerController.createEmpire);
router.get('/', employerController.getEmpires);
router.put('/:id', employerController.updateEmpire);
router.delete('/:id', employerController.deleteEmpire);

module.exports = router;
