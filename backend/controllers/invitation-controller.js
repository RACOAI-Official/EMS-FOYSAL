const crypto = require('crypto');
const InvitationModel = require('../models/invitation-model');
const ErrorHandler = require('../utils/error-handler');
const mailService = require('../services/mail-service');

class InvitationController {
  inviteUser = async (req, res, next) => {
    try {
      const { email, type, position } = req.body;

      if (!email || !type || !position) {
        return next(ErrorHandler.badRequest('Email, User Type, and Position are required'));
      }

      // Role-based invitation restriction
      const inviterType = req.user.type.toLowerCase();
      const targetType = type.toLowerCase();

      if (inviterType === 'sub_admin') {
        if (['super_admin', 'sub_admin'].includes(targetType)) {
          return next(ErrorHandler.badRequest('Sub Admin can only invite Leader and Employee'));
        }
      }

      if (inviterType === 'super_admin') {
        if (targetType === 'super_admin') {
          return next(ErrorHandler.badRequest('Super Admin cannot invite another Super Admin'));
        }
      }

      // Check if invitation already exists
      const existingInvitation = await InvitationModel.findOne({ email });
      if (existingInvitation && existingInvitation.status === 'pending') {
        return next(ErrorHandler.badRequest('Invitation already sent to this email'));
      }

      // Generate unique token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

      const invitation = await InvitationModel.create({
        email,
        type: type.toLowerCase(),
        position,
        token,
        expiresAt
      });

      // Send Email
      const registrationLink = `${process.env.CLIENT_URL}/register/${token}`;
      try {
        await mailService.sendInvitationMail(email, type, registrationLink);
      } catch (mailError) {
        console.error("Mail Error:", mailError);
        // Delete the invitation if email fails so they can retry
        await InvitationModel.findByIdAndDelete(invitation._id);
        return next(ErrorHandler.serverError(`Failed to send email: ${mailError.message}`));
      }

      res.json({
        success: true,
        message: 'Invitation sent successfully',
        data: invitation
      });
    } catch (error) {
      next(error);
    }
  };

  verifyInvitation = async (req, res, next) => {
    try {
      const { token } = req.params;
      const invitation = await InvitationModel.findOne({ token });

      if (!invitation) {
        return next(ErrorHandler.notFound('Invalid invitation link'));
      }

      if (invitation.status !== 'pending') {
        return next(ErrorHandler.badRequest('Invitation link has already been used'));
      }

      if (new Date() > invitation.expiresAt) {
        invitation.status = 'expired';
        await invitation.save();
        return next(ErrorHandler.badRequest('Invitation link has expired'));
      }

      res.json({
        success: true,
        message: 'Invitation verified',
        data: {
          email: invitation.email,
          type: invitation.type,
          position: invitation.position
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new InvitationController();
