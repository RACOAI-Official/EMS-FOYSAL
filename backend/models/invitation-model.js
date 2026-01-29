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
      'AI Engineer', 'AI Developer',
      'Full Stack Developer', 'Full Stack Engineer',
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invitation', invitationSchema, 'invitations');
