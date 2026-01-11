const employerService = require('../services/employer-service');
const userService = require('../services/user-service');
const teamService = require('../services/team-service');
const ErrorHandler = require('../utils/error-handler');
const mongoose = require('mongoose');

class EmpireController {
  createEmpire = async (req, res, next) => {
    try {
      const { name, description } = req.body;
      if (!name) return next(ErrorHandler.badRequest('Empire name is required'));
      const existing = await employerService.findEmpire({ name });
      if (existing) return next(ErrorHandler.badRequest('Empire already exists'));

      const empire = await employerService.createEmpire({ name, description });
      res.json({ success: true, message: 'Empire created successfully', data: empire });
    } catch (error) {
      next(error);
    }
  }

  getEmpires = async (req, res, next) => {
    try {
      const empires = await employerService.findEmpires();
      res.json({ success: true, data: empires });
    } catch (error) {
      next(error);
    }
  }

  updateEmpire = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, status } = req.body;
      const empire = await employerService.updateEmpire(id, { name, description, status });
      if (!empire) return next(ErrorHandler.notFound('Empire not found'));
      res.json({ success: true, message: 'Empire updated successfully', data: empire });
    } catch (error) {
      next(error);
    }
  }

  deleteEmpire = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) return next(ErrorHandler.badRequest('Invalid Empire ID'));

      const empire = await employerService.findEmpire({ _id: id });
      if (!empire) return next(ErrorHandler.notFound('Empire not found'));

      // 1. Delete all Problems associated with this empire
      // Assuming problems are linked to empire.
      await mongoose.model('Problem').deleteMany({ empire: id }).session(session);

      // 2. Find all Teams under this empire
      const teams = await teamService.findTeams({ empire: id });
      const teamIds = teams.map(t => t._id);

      // 3. Find all Leaders and Employers under this empire
      // We can delete users where empire matches or they belong to a team in this empire
      await mongoose.model('User').deleteMany({
        $or: [
          { empire: id },
          { team: { $in: teamIds } }
        ]
      }).session(session);

      // 4. Delete all Teams under this empire
      await mongoose.model('Team').deleteMany({ empire: id }).session(session);

      // 5. Delete the Empire itself
      await employerService.deleteEmpire(id);

      await session.commitTransaction();
      res.json({ success: true, message: 'Empire and all associated data deleted successfully' });
    } catch (error) {
      await session.abortTransaction();
      next(error);
    } finally {
      session.endSession();
    }
  }
}

module.exports = new EmpireController();
