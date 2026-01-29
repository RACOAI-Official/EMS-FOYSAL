const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const problemSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: String,
    required: true,
    trim: true
  },
  problemLocation: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  image: {
    type: String,
    required: false
  },
  empire: {
    type: Schema.Types.ObjectId,
    ref: 'Empire'
  },
  status: {
    type: String,
    enum: ['Un Checked', 'Checked'],
    default: 'Un Checked'
  },
  adminSolution: {
    type: String,
    required: false
  },
  solutionDate: {
    type: Date,
    required: false
  },
  solutionBy: {
    type: String,
    enum: ['Admin', 'Leader'],
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Problem', problemSchema, 'problems');
