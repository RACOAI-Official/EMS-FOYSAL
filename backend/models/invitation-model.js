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
        'AI Engineer', 'AI Developer', 'Backend AI Engineer','Machine Learning Engineer', 'UI/UX Designer','Full Stack Developer', 'Full Stack Engineer','Backend Developer', 'Backend Engineer','Frontend Developer','Frontend Engineer',  'Data Scientist', 'Software Engineer', 'Data Analyst', 'DevOps Engineer', 'Project Manager', 
        'Business Analyst', 'CTO','CFO','CMO','Marketing Manager', 'Sales Manager',
        'Sales Executive', 'Customer Support', 'HR Manager', 'HR Executive',
        'Marketing Specialist', 'Content Creator', 'Graphic Designer', 'Financial Analyst', 'Operations Manager', 'Product Owner', 'Scrum Master',
        'HR', 'CEO', 'COO',
        'Office Assistant', 'Receptionist', 'Intern', 'Consultant', 'Freelancer', 'Contractor', 'Volunteer', 'Advisor', 'Board Member', 'Shareholder','Not Specified'
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
