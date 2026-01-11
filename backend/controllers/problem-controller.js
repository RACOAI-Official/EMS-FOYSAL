const problemService = require('../services/problem-service');
const ErrorHandler = require('../utils/error-handler');
const mongoose = require('mongoose');

class ProblemController {
  submitProblem = async (req, res, next) => {
    const { project, problemLocation, description, priority, empireId } = req.body;
    const file = req.file;
    if (!project || !problemLocation || !description) {
      return next(ErrorHandler.badRequest('Required fields are missing'));
    }

    const problemData = {
      user: req.user._id,
      project,
      problemLocation,
      description,
      priority: priority || 'Low',
      image: file ? file.filename : undefined,
      empire: empireId
    };

    const problem = await problemService.createProblem(problemData);
    if (!problem) {
      return next(ErrorHandler.serverError('Failed to submit problem'));
    }

    // Notify Admins
    const User = require('../models/user-model');
    const Notification = require('../models/notification-model');
    const admins = await User.find({ type: 'Admin' });

    // Create notification for each admin
    const notifications = admins.map(admin => ({
      title: 'New Mission Report',
      message: `${req.user.name} submitted a new report: ${project}`,
      type: 'problem',
      link: '/admin/problems',
      user: admin._id
    }));

    await Notification.insertMany(notifications);

    res.json({
      success: true,
      message: 'Problem submitted successfully',
      data: problem
    });
  }

  getUserProblems = async (req, res, next) => {
    const problems = await problemService.findProblems({ user: req.user._id });
    res.json({
      success: true,
      data: problems
    });
  }

  getAllProblems = async (req, res, next) => {
    const problems = await problemService.findProblems({});
    res.json({
      success: true,
      data: problems
    });
  }

  getScopedProblems = async (req, res, next) => {
    try {
      // Find all team members first
      const team = await mongoose.model('Team').findOne({ leader: req.user._id });
      if (!team) return next(ErrorHandler.notFound('You are not leading any team'));

      const members = await mongoose.model('User').find({ team: team._id });
      const memberIds = members.map(m => m._id);

      const problems = await problemService.findProblems({ user: { $in: memberIds } });
      res.json({
        success: true,
        data: problems
      });
    } catch (error) {
      next(error);
    }
  }

  updateProblemStatus = async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return next(ErrorHandler.badRequest('Status is required'));
    }

    const problem = await problemService.updateProblem(id, { status });
    if (!problem) {
      return next(ErrorHandler.notFound('Problem not found'));
    }

    res.json({
      success: true,
      message: 'Problem status updated successfully',
      data: problem
    });
  }

  provideSolution = async (req, res, next) => {
    const { id } = req.params;
    const { solution } = req.body;

    if (!solution) return next(ErrorHandler.badRequest('Solution is required'));

    const problem = await problemService.updateProblem(id, {
      adminSolution: solution,
      solutionDate: new Date(),
      status: 'Checked' // Auto-update status to Checked when solved
    });

    if (!problem) return next(ErrorHandler.notFound('Problem not found'));

    res.json({
      success: true,
      message: 'Solution provided successfully',
      data: problem
    });
  }

  getProblem = async (req, res, next) => {
    const { id } = req.params;
    const problem = await problemService.findProblem({ _id: id });
    if (!problem) {
      return next(ErrorHandler.notFound('Problem not found'));
    }
    res.json({
      success: true,
      data: problem
    });
  }
}

module.exports = new ProblemController();
