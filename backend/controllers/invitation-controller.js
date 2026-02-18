const crypto = require('crypto');
const InvitationModel = require('../models/invitation-model');
const UserModel = require('../models/user-model');
const ErrorHandler = require('../utils/error-handler');
const mailService = require('../services/mail-service');

const normalizeUrl = (value = '') => String(value).trim().replace(/\/+$/, '');

const getClientRegisterBaseUrl = () => {
  const configuredUrls = String(process.env.CLIENT_URL || '')
    .split(',')
    .map(normalizeUrl)
    .filter(Boolean);

  if (configuredUrls.length === 0) return 'http://192.168.10.13:3000';

  const preferredUrl = configuredUrls.find((url) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname !== 'localhost' && hostname !== '127.0.0.1';
    } catch (error) {
      return false;
    }
  });

  return preferredUrl || configuredUrls[0];
};

class InvitationController {
  inviteUser = async (req, res, next) => {
    try {
      const { email, type, position } = req.body;
      const normalizedEmail = String(email || '').trim().toLowerCase();

      if (!normalizedEmail || !type || !position) {
        return next(ErrorHandler.badRequest('Email, User Type, and Position are required'));
      }

      // Block re-invite if this email is already registered as a user.
      const existingUser = await UserModel.findOne({
        email: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      }).select('_id email');

      if (existingUser) {
        return next(
          ErrorHandler.conflict(`${normalizedEmail}, This user has been already registered.`)
        );
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

      // Generate unique token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

      // Re-invite flow:
      // If invitation exists for this email, refresh token + expiry and mark as pending.
      // This allows sending invitation multiple times to the same email.
      let invitation = await InvitationModel.findOne({ email: normalizedEmail });

      if (invitation) {
        invitation.type = type.toLowerCase();
        invitation.position = position;
        invitation.token = token;
        invitation.expiresAt = expiresAt;
        invitation.status = 'pending';
        invitation.empire = req.body.empire || null;
        invitation = await invitation.save();
      } else {
        invitation = await InvitationModel.create({
          email: normalizedEmail,
          type: type.toLowerCase(),
          position,
          token,
          expiresAt,
          empire: req.body.empire || null
        });
      }

      // Send Email
      const registrationLink = `${getClientRegisterBaseUrl()}/register/${token}`;
      try {
        await mailService.sendInvitationMail(normalizedEmail, type, registrationLink);
      } catch (mailError) {
        console.error("Mail Error:", mailError);
        // Keep record so admin can retry; mark expired to avoid accidental use.
        invitation.status = 'expired';
        await invitation.save();
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
      const invitation = await InvitationModel.findOne({ token }).populate('empire');

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
          position: invitation.position,
          empire: invitation.empire
        }
      });
    } catch (error) {
      next(error);
    }
  };

  getInvitations = async (req, res, next) => {
    try {
      const rawPage = Number.parseInt(req.query.page, 10);
      const rawLimit = Number.parseInt(req.query.limit, 10);
      const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
      const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 500) : 200;
      const skip = (page - 1) * limit;

      const invitations = await InvitationModel.find(
        {},
        'email type position status expiresAt createdAt updatedAt'
      )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      res.json({
        success: true,
        data: invitations,
        pagination: {
          page,
          limit,
          hasMore: invitations.length === limit
        }
      });
    } catch (error) {
      next(error);
    }
  };

  deleteInvitation = async (req, res, next) => {
    try {
      const { id } = req.params;
      const invitation = await InvitationModel.findByIdAndDelete(id);
      if (!invitation) return next(ErrorHandler.notFound('Invitation not found'));
      res.json({
        success: true,
        message: 'Invitation deleted'
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new InvitationController();
