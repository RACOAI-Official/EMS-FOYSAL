const Task = require('../models/task-model');
const User = require('../models/user-model');
const Notification = require('../models/notification-model');
const socketService = require('../services/socket-service');
const ErrorHandler = require('../utils/error-handler');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const logFile = path.join(__dirname, '../debug.log');
const log = (msg) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
  console.log(msg);
};

class TaskController {
  createTask = async (req, res, next) => {
    log('=== TASK CREATE REQUEST ===');
    const { description, assignedTo, startDate, endDate, title: bodyTitle } = req.body;
    let title = bodyTitle;

    // If leader, verify assignedTo is in their team
    if (req.user.type === 'leader') {
      const Team = require('../models/team-model');
      const team = await Team.findOne({ leader: req.user._id });
      if (!team) return next(ErrorHandler.badRequest('You must be leading a team to assign tasks'));

      const user = await User.findById(assignedTo);
      if (!user || user.team.toString() !== team._id.toString()) {
        return next(ErrorHandler.unauthorized('You can only assign tasks to members of your own team'));
      }
    }

    // Fallback for title
    if (!title) {
      try {
        const user = await User.findById(assignedTo).populate('team');
        if (user && user.team && user.team.name) {
          title = user.team.name;
        }
      } catch (err) {
        log('Error finding/populating user for fallback title: ' + err.message);
      }
    }

    if (!title) {
      return next(ErrorHandler.badRequest('Title is required'));
    }

    const file = req.file ? req.file.path : null;

    try {
      const task = await Task.create({
        title,
        description,
        assignedTo,
        startDate,
        endDate,
        file,
        assignedBy: req.user._id
      });

      // Notify Assigned User (DB)
      await Notification.create({
        title: 'New Mission Assigned',
        message: `You have a new mission: ${title}`,
        type: 'problem',
        link: '/dashboardEmployee',
        user: assignedTo
      });

      // Emit Real-time Notification
      socketService.emitToUser(assignedTo, 'notification', {
        title: 'New Mission Assigned',
        message: `You have a new mission: ${title}`,
        type: 'problem',
        link: '/dashboardEmployee'
      });

      res.status(201).json({ message: 'Task created successfully', task });
    } catch (err) {
      next(ErrorHandler.serverError('Failed to create task: ' + err.message));
    }
  }

  getAdminTasks = async (req, res, next) => {
    const tasks = await Task.find({ isDeleted: false })
      .populate({
        path: 'assignedTo',
        select: 'name email type',
        populate: { path: 'team', select: 'name' }
      })
      .populate('assignedBy', 'name');
    res.json(tasks);
  }

  getLeaderTasks = async (req, res, next) => {
    const Team = require('../models/team-model');
    const team = await Team.findOne({ leader: req.user._id });
    if (!team) return res.json([]);

    const teamMembers = await User.find({ team: team._id }).select('_id');
    const memberIds = teamMembers.map(u => u._id);

    const tasks = await Task.find({
      assignedTo: { $in: memberIds },
      isDeleted: false
    })
      .populate({
        path: 'assignedTo',
        select: 'name email type',
        populate: { path: 'team', select: 'name' }
      })
      .populate('assignedBy', 'name');

    res.json(tasks);
  }

  softDeleteTask = async (req, res, next) => {
    const task = await Task.findById(req.params.id);
    if (!task) return next(ErrorHandler.notFound('Task not found'));

    task.isDeleted = true;
    await task.save();
    res.json({ message: 'Task deleted successfully' });
  }

  downloadPDF = async (req, res, next) => {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name email');
    if (!task) return next(ErrorHandler.notFound('Task not found'));

    const isAdmin = ['super_admin', 'sub_admin'].includes(req.user.type);
    const isAssigned = task.assignedTo && task.assignedTo._id.toString() === req.user._id.toString();

    if (!isAdmin && !isAssigned) {
      return next(ErrorHandler.unauthorized('Access denied'));
    }

    const mode = req.query.mode || (isAdmin ? 'view' : 'download');
    const disposition = mode === 'view' ? 'inline' : 'attachment';

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${disposition}; filename="task-${task._id}.pdf"`);

    doc.pipe(res);
    doc.fontSize(25).text('Task Details', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Title: ${task.title}`);
    doc.moveDown();
    doc.text(`Description: ${task.description}`);
    doc.moveDown();
    if (task.startDate) doc.text(`Start Date: ${new Date(task.startDate).toLocaleDateString()}`);
    if (task.endDate) doc.text(`End Date: ${new Date(task.endDate).toLocaleDateString()}`);
    doc.moveDown();
    doc.text(`Assigned To: ${task.assignedTo ? task.assignedTo.name : 'Unknown'}`);
    doc.text(`Email: ${task.assignedTo ? task.assignedTo.email : 'Unknown'}`);
    doc.moveDown();
    doc.text(`Created At: ${new Date(task.createdAt).toLocaleString()}`);
    doc.text(`Status: ${task.isDeleted ? 'Status: Deleted' : 'Status: Active'}`);
    doc.end();
  }

  getUserTasks = async (req, res, next) => {
    const tasks = await Task.find({
      assignedTo: req.user._id,
      isDeleted: false
    }).populate('assignedBy', 'name');
    res.json(tasks);
  }

  updateTaskProgress = async (req, res, next) => {
    const { progress, progressNote } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return next(ErrorHandler.notFound('Task not found'));

    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return next(ErrorHandler.unauthorized('Unauthorized'));
    }

    task.progress = progress;
    task.progressNote = progressNote;
    await task.save();
    res.json({ success: true, message: 'Progress updated', task });
  }
}

module.exports = new TaskController();
