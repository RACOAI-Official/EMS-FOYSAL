const employerService = require('../services/employer-service');
const userService = require('../services/user-service');
const teamService = require('../services/team-service');
const ErrorHandler = require('../utils/error-handler');
const mongoose = require('mongoose');
const fileService = require('../services/file-service');
const problemService = require('../services/problem-service');

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

      // 1. Delete all Problem images associated with this empire
      const problems = await problemService.findProblems({ empire: id });
      if (problems && problems.length > 0) {
        for (const problem of problems) {
          if (problem.image) {
            fileService.deleteProblemImage(problem.image);
          }
        }
      }
      await mongoose.model('Problem').deleteMany({ empire: id }).session(session);

      // 2. Find all Teams under this empire
      const teams = await teamService.findTeams({ empire: id });
      const teamIds = teams.map(t => t._id);

      // 3. Find and Delete User files, then delete Users
      const users = await userService.findUsers({
        $or: [
          { empire: id },
          { team: { $in: teamIds } }
        ]
      });

      if (users && users.length > 0) {
        for (const user of users) {
          await fileService.deleteUserFiles(user, problemService);
        }
      }

      // 3.1. Delete any Invitations for these users
      if (users && users.length > 0) {
        const emails = users.map(u => u.email);
        await mongoose.model('Invitation').deleteMany({ email: { $in: emails } }).session(session);
      }

      await mongoose.model('User').deleteMany({
        $or: [
          { empire: id },
          { team: { $in: teamIds } }
        ]
      }).session(session);

      // 4. Delete all Teams under this empire (and their images)
      if (teams && teams.length > 0) {
        for (const team of teams) {
          if (team.image) {
            fileService.deleteTeamImage(team.image);
          }
        }
      }
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
