const router = require('express').Router();
const PDFDocument = require('pdfkit');
const Task = require('../models/task-model');
const User = require('../models/user-model');
const { authRole } = require('../middlewares/auth-middleware');
const asyncMiddleware = require('../middlewares/async-middleware');
const upload = require('../services/file-upload-service');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../debug.log');
const log = (msg) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
  console.log(msg);
};

log('DEBUG: User model loaded, type: ' + typeof User);
log('DEBUG: User.findById type: ' + typeof User.findById);

// ADMIN & LEADER ROUTES
router.post('/admin', authRole(['super_admin', 'sub_admin', 'leader']), upload.single('taskFile'), asyncMiddleware(async (req, res, next) => {
  log('=== TASK CREATE REQUEST ===');
  log('Body: ' + JSON.stringify(req.body));

  const { description, assignedTo, startDate, endDate } = req.body;
  let { title } = req.body;

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

  log(`Title from body: "${title}"`);
  log(`Assigned to user ID: ${assignedTo}`);

  // If title is not provided in body, fallback to user's team name
  if (!title) {
    try {
      const user = await User.findById(assignedTo).populate('team');
      if (user && user.team && user.team.name) {
        title = user.team.name;
        log(`Setting task title to project name (fallback): "${title}"`);
      }
    } catch (err) {
      log('Error finding/populating user for fallback title: ' + err.message);
    }
  }

  if (!title) {
    log('Error: Title is empty');
    const ErrorHandler = require('../utils/error-handler');
    return next(ErrorHandler.badRequest('Title is required and could not be determined from user team'));
  }

  let file = null;
  if (req.file) {
    file = req.file.path;
    log('File uploaded: ' + file);
  }

  log(`Final task object to create: title="${title}", assignedTo="${assignedTo}"`);

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

    log('✅ Task created successfully in DB: ' + task._id);

    // Notify Assigned User
    const Notification = require('../models/notification-model');
    await Notification.create({
      title: 'New Mission Assigned',
      message: `You have a new mission: ${title}`,
      type: 'problem', // Using 'problem' type icon/color for tasks as well for now, or could add 'task' type
      link: '/dashboardEmployee',
      user: assignedTo
    });

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (err) {
    log('Error creating task in DB: ' + err.message);
    const ErrorHandler = require('../utils/error-handler');
    return next(ErrorHandler.serverError('Failed to create task: ' + err.message));
  }
}));

// Get All Tasks (Admin view)
router.get('/admin', authRole(['super_admin', 'sub_admin']), asyncMiddleware(async (req, res, next) => {
  const tasks = await Task.find({ isDeleted: false })
    .populate({
      path: 'assignedTo',
      select: 'name email type',
      populate: { path: 'team', select: 'name' }
    })
    .populate('assignedBy', 'name');
  res.json(tasks);
}));

// Get Team Tasks (Leader view)
router.get('/leader', authRole(['leader']), asyncMiddleware(async (req, res, next) => {
  const Team = require('../models/team-model');

  // Find the team led by this user
  const team = await Team.findOne({ leader: req.user._id });
  if (!team) {
    // It's possible the leader has no team assigned yet, returning empty list
    return res.json([]);
  }

  // Find all users in this team
  const teamMembers = await User.find({ team: team._id }).select('_id');
  const memberIds = teamMembers.map(u => u._id);

  // Find tasks assigned to these members
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
}));

// Soft Delete Task
router.delete('/admin/:id', authRole(['super_admin', 'sub_admin']), asyncMiddleware(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) return next(ErrorHandler.notFound('Task not found'));

  task.isDeleted = true;
  await task.save();

  res.json({ message: 'Task deleted successfully' });
}));

// Download PDF
// Download/View PDF
// Access: Admin OR Assigned User
router.get('/:id/pdf', asyncMiddleware(async (req, res, next) => {
  const task = await Task.findById(req.params.id).populate('assignedTo', 'name email');
  if (!task) return next(ErrorHandler.notFound('Task not found'));

  // Authorization check: Admin OR Assigned User
  const isAdmin = ['super_admin', 'sub_admin'].includes(req.user.type);
  const isAssigned = task.assignedTo && task.assignedTo._id.toString() === req.user._id.toString();

  if (!isAdmin && !isAssigned) {
    return next(ErrorHandler.unauthorized('You do not have permission to view this task PDF'));
  }

  const doc = new PDFDocument();

  // Determine disposition based on query or role
  // user request: "admin... only be able to view... download it only from the user dashboard"
  // If admin -> inline (view)
  // If user -> attachment (download)
  // Or strict query param ?mode=view|download

  const mode = req.query.mode || (isAdmin ? 'view' : 'download');
  const disposition = mode === 'view' ? 'inline' : 'attachment';

  // Set headers
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
  doc.text(`Status: ${task.isDeleted ? 'Deleted' : 'Active'}`);

  doc.end();
}));


// USER ROUTES

// Get Assigned Tasks
router.get('/user', asyncMiddleware(async (req, res, next) => {
  console.log('GET /user called by:', req.user._id, req.user.name);
  // Users can only see tasks assigned to them AND not deleted
  const tasks = await Task.find({
    assignedTo: req.user._id,
    isDeleted: false
  }).populate('assignedBy', 'name');
  console.log('Found tasks:', tasks.length);

  res.json(tasks);
}));

// Update Task Progress
router.patch('/:id/progress', asyncMiddleware(async (req, res, next) => {
  const { progress, progressNote } = req.body;
  const taskId = req.params.id;

  const task = await Task.findById(taskId);
  if (!task) {
    const ErrorHandler = require('../utils/error-handler');
    return next(ErrorHandler.notFound('Task not found'));
  }

  // Authorization check: Only the assigned user can update progress
  if (task.assignedTo.toString() !== req.user._id.toString()) {
    const ErrorHandler = require('../utils/error-handler');
    return next(ErrorHandler.unauthorized('You are not authorized to update this task'));
  }

  task.progress = progress;
  task.progressNote = progressNote;
  await task.save();

  res.json({ success: true, message: 'Progress updated successfully', task });
}));

module.exports = router;
