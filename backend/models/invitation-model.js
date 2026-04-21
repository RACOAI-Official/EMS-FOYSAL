const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const invitationSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['super_admin', 'sub_admin', 'leader', 'employee', 'employer']
  },
  position: {
    type: String,
    required: true,
    enum: [
      'AI Engineer', 'AI Developer', 'Backend AI Engineer', 'Data Scientist', 'Machine Learning Engineer', 'UI/UX Designer','Full Stack Developer', 'Full Stack Engineer', 'Product Manager',  
      'CTO','CFO','CMO','Software Engineer', 'Data Analyst', 'DevOps Engineer', 'Project Manager', 'Business Analyst', 'Marketing Manager', 'Sales Manager',
      'Sales Executive', 'Customer Support', 'HR Manager',
      'Marketing Specialist', 'Content Creator', 'Graphic Designer', 'Financial Analyst', 'Operations Manager', 'Product Owner', 'Scrum Master',
      'HR', 'CEO', 'COO', 'Not Specified'
    ],
    default: 'Not Specified'
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'expired'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  empire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer'
  }
}, {
  timestamps: true
});

// Supports fast "latest invitations first" queries.
invitationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Invitation', invitationSchema, 'invitations');
