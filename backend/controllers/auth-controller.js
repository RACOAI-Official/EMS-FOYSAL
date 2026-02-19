const crypto = require('crypto');
const validator = require('validator');
const ErrorHandler = require('../utils/error-handler');
const userService = require('../services/user-service');
const tokenService = require('../services/token-service');
const otpService = require('../services/otp-service');
const mailService = require('../services/mail-service');
const InvitationModel = require('../models/invitation-model');
const UserDto = require('../dtos/user-dto');
const { generateEmployeeId } = require('../utils/id-generator');

const cookieSameSite = process.env.COOKIE_SAME_SITE || (process.env.NODE_ENV === 'production' ? 'none' : 'lax');
const isSecureCookie = cookieSameSite === 'none' || process.env.NODE_ENV === 'production';
const baseCookieOptions = {
    httpOnly: true,
    sameSite: cookieSameSite,
    secure: isSecureCookie,
    path: '/'
};
const authCookieMaxAge = 1000 * 60 * 60 * 24 * 30;
const authCookieOptions = {
    ...baseCookieOptions,
    maxAge: authCookieMaxAge
};

class AuthController {

    // ==================== LOGIN ====================
    login = async (req, res, next) => {
        try {
            const { email, emailOrUsername, password } = req.body;
            const identifier = (emailOrUsername || email || '').trim();

            if (!identifier || !password) {
                return next(ErrorHandler.badRequest('Email and Password are required'));
            }

            let user;
            if (validator.isEmail(identifier)) {
                user = await userService.findUser({ email: identifier.toLowerCase() });
            } else {
                user = await userService.findUser({ username: identifier });
            }

            if (!user) return next(ErrorHandler.badRequest('Invalid Email or Username'));
            if (user.status === 'banned') return next(ErrorHandler.badRequest('Your account has been banned, please contact admin'));

            const isValid = await userService.verifyPassword(password, user.password);
            if (!isValid) return next(ErrorHandler.badRequest('Invalid Password'));

            const payload = {
                _id: user._id,
                email: user.email,
                username: user.username,
                name: user.name,
                type: user.type
            };

            const { accessToken, refreshToken } = tokenService.generateToken(payload);
            await tokenService.storeRefreshToken(user._id, refreshToken);

            res.cookie('accessToken', accessToken, authCookieOptions);
            res.cookie('refreshToken', refreshToken, authCookieOptions);

            user.status = 'active';
            await user.save();

            res.json({ success: true, message: 'Login Successful', user: new UserDto(user) });
        } catch (error) {
            next(error);
        }
    }

    // ==================== FORGOT PASSWORD ====================
    forgot = async (req, res, next) => {
        try {
            const { email } = req.body;
            if (!email || !validator.isEmail(email)) return next(ErrorHandler.badRequest('Invalid Email Address'));

            const emailNorm = email.toLowerCase();
            const user = await userService.findUser({ email: emailNorm });

            if (!user) return next(ErrorHandler.notFound('No Account Found'));

            const type = process.env.TYPE_FORGOT_PASSWORD || 2;

            // Check cooldown
            const existingOtp = await otpService.getOtp(user._id, type);
            const cooldownMs = 60 * 1000;
            if (existingOtp) {
                const timeSinceLastOtp = Date.now() - new Date(existingOtp.createdAt).getTime();
                if (timeSinceLastOtp < cooldownMs) {
                    const secondsLeft = Math.ceil((cooldownMs - timeSinceLastOtp) / 1000);
                    return res.json({
                        success: false,
                        message: `Please wait ${secondsLeft} seconds before requesting a new OTP.`
                    });
                }
            }

            await otpService.removeOtp(user._id);
            const otp = otpService.generateOtp();
            await otpService.storeOtp(user._id, otp, type);
            await mailService.sendForgotPasswordMail(user.name, user.email, otp);

            res.json({ success: true, message: 'OTP has been sent to your email address.' });
        } catch (error) {
            next(error);
        }
    }

    // ==================== RESET PASSWORD ====================
    reset = async (req, res, next) => {
        try {
            const { email, otp, password } = req.body;
            if (!email || !otp || !password) return next(ErrorHandler.badRequest('Email, OTP, and Password are required'));

            const emailNorm = email.toLowerCase();
            const user = await userService.findUser({ email: emailNorm });
            if (!user) return next(ErrorHandler.notFound('No Account Found'));

            const type = process.env.TYPE_FORGOT_PASSWORD || 2;
            let response = await otpService.verifyOtp(user._id, otp, type);

            if (response === 'INVALID') return next(ErrorHandler.badRequest('Invalid OTP'));

            if (response === 'EXPIRED') {
                // Check cooldown before sending new OTP
                const cooldownMs = 60 * 1000;
                const existingOtp = await otpService.getOtp(user._id, type);
                const timeSinceLastOtp = existingOtp ? Date.now() - new Date(existingOtp.createdAt).getTime() : cooldownMs + 1;

                if (timeSinceLastOtp < cooldownMs) {
                    const secondsLeft = Math.ceil((cooldownMs - timeSinceLastOtp) / 1000);
                    return res.json({
                        success: false,
                        message: `OTP expired. Please wait ${secondsLeft} seconds before requesting a new OTP.`
                    });
                }

                // Generate new OTP
                const newOtp = otpService.generateOtp();
                await otpService.removeOtp(user._id);
                await otpService.storeOtp(user._id, newOtp, type);
                await mailService.sendForgotPasswordMail(user.name, user.email, newOtp);

                return res.json({
                    success: false,
                    message: 'Your OTP has expired. A new OTP has been sent to your email address.'
                });
            }

            // OTP valid → reset password
            const { modifiedCount } = await userService.updatePassword(user._id, password);
            if (modifiedCount !== 1) return next(ErrorHandler.serverError('Failed to reset your password'));

            res.json({ success: true, message: 'Password has been reset successfully' });
        } catch (error) {
            next(error);
        }
    }

    // ==================== LOGOUT ====================
    logout = async (req, res, next) => {
        try {
            const { refreshToken } = req.cookies;
            const { _id } = req.user;

            const response = await tokenService.removeRefreshToken(_id, refreshToken);
            await userService.updateUser(_id, { status: 'deactive' });

            res.clearCookie('refreshToken', baseCookieOptions);
            res.clearCookie('accessToken', baseCookieOptions);

            return (response.modifiedCount === 1)
                ? res.json({ success: true, message: 'Logout Successfully' })
                : next(ErrorHandler.unAuthorized());
        } catch (error) {
            next(error);
        }
    }

    // ==================== REFRESH TOKEN ====================
    refresh = async (req, res, next) => {
        try {
            const { refreshToken: refreshTokenFromCookie } = req.cookies;
            if (!refreshTokenFromCookie) return res.status(401).json({ success: false, message: 'Unauthorized Access' });

            const userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
            const { _id, email, username } = userData;

            const token = await tokenService.findRefreshToken(_id, refreshTokenFromCookie);
            if (!token) {
                res.clearCookie('refreshToken', baseCookieOptions);
                res.clearCookie('accessToken', baseCookieOptions);
                return res.status(401).json({ success: false, message: 'Unauthorized Access' });
            }

            const user = await userService.findUser({ email });
            if (!user) {
                res.clearCookie('refreshToken', baseCookieOptions);
                res.clearCookie('accessToken', baseCookieOptions);
                return res.status(401).json({ success: false, message: 'User not found' });
            }

            if (user.status === 'banned') return next(ErrorHandler.unAuthorized('Your account has been banned, please contact admin'));

            const payload = { _id, email, username, name: user.name, type: user.type };
            const { accessToken, refreshToken } = tokenService.generateToken(payload);

            await tokenService.updateRefreshToken(_id, refreshTokenFromCookie, refreshToken);

            res.cookie('accessToken', accessToken, authCookieOptions);
            res.cookie('refreshToken', refreshToken, authCookieOptions);

            user.status = 'active';
            await user.save();

            res.json({ success: true, message: 'Secure access has been granted', user: new UserDto(user) });
        } catch (error) {
            next(error);
        }
    }

    // ==================== REGISTER INVITED USER ====================
    registerInvited = async (req, res, next) => {
        try {
            const {
                token, name, password, mobile, fatherName, motherName,
                presentAddress, permanentAddress, nid, bloodGroup
            } = req.body;

            if (!token || !name || !password || !mobile) {
                return next(ErrorHandler.badRequest('Required fields are missing'));
            }

            const invitation = await InvitationModel.findOne({ token, status: 'pending' });
            if (!invitation) return next(ErrorHandler.badRequest('Invalid or expired invitation'));

            if (new Date() > invitation.expiresAt) {
                invitation.status = 'expired';
                await invitation.save();
                return next(ErrorHandler.badRequest('Invitation has expired'));
            }

            const existingUser = await userService.findUser({ email: invitation.email });
            if (existingUser) return next(ErrorHandler.badRequest('User already registered'));

            const employeeId = generateEmployeeId();
            const username = 'user' + crypto.randomInt(11111111, 999999999);
            const image = req.file ? req.file.path : 'user.png';

            const user = await userService.createUser({
                name,
                email: invitation.email,
                username,
                password,
                mobile,
                type: invitation.type,
                position: invitation.position,
                fatherName,
                motherName,
                presentAddress,
                permanentAddress,
                address: permanentAddress,
                nid,
                bloodGroup,
                employeeId,
                image,
                empire: invitation.empire || null,
                status: 'active'
            });

            invitation.status = 'completed';
            await invitation.save();

            res.json({
                success: true,
                message: 'Registration successful! Your Employee ID is ' + employeeId,
                user: new UserDto(user)
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
