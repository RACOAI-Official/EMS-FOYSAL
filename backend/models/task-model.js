const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  file: {
    type: String,
    required: false
  },
  startDate: {
    type: Date,
    required: false
  },
  endDate: {
    type: Date,
    required: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  progressNote: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
