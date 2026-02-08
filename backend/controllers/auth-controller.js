const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcrypt');
const ErrorHandler = require('../utils/error-handler');
const userService = require('../services/user-service');
const tokenService = require('../services/token-service');
const UserDto = require('../dtos/user-dto');
const otpService = require('../services/otp-service');
const mailService = require('../services/mail-service');
const InvitationModel = require('../models/invitation-model');
const { generateEmployeeId } = require('../utils/id-generator');

class AuthController {

    login = async (req, res, next) => {
        try {
            const { email, emailOrUsername, password } = req.body;
            console.log('Login attempt with:', { email: email || emailOrUsername, password: '***' });

            const identifier = (emailOrUsername || email || '').trim();

            if (!identifier || !password) {
                console.log('Missing email or password');
                return next(ErrorHandler.badRequest('Email and Password are required'));
            }

            let data;
            if (validator.isEmail(identifier))
                data = { email: identifier }
            else
                data = { username: identifier };

            console.log('Finding user with:', data);
            const user = await userService.findUser(data);

            if (!user) {
                console.log('User not found');
                return next(ErrorHandler.badRequest('Invalid Email or Username'));
            }

            console.log('User found:', { id: user._id, email: user.email, status: user.status });
            const { _id, name, username, email: dbEmail, password: hashPassword, type, status } = user;

            if (status === 'banned') {
                console.log('User account is banned');
                return next(ErrorHandler.badRequest('Your account has been banned, Please contact to the admin'));
            }

            console.log('Verifying password...');
            const isValid = await userService.verifyPassword(password, hashPassword);

            if (!isValid) {
                console.log('Password verification failed');
                return next(ErrorHandler.badRequest('Invalid Password'));
            }

            console.log('Password verified successfully');
            const payload = {
                _id,
                email: dbEmail,
                username,
                name,
                type
            }
            const { accessToken, refreshToken } = tokenService.generateToken(payload);
            console.log("Access Token Generated", accessToken.substring(0, 20) + '...');
            console.log("Refresh Token Generated", refreshToken.substring(0, 20) + '...');

            await tokenService.storeRefreshToken(_id, refreshToken);
            console.log('Refresh token stored');

            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true
            });
            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true
            })

            console.log('Cookies set, sending response');
            user.status = 'active';
            await user.save();
            res.json({ success: true, message: 'Login Successfull', user: new UserDto(user) })
        } catch (error) {
            console.error('Login error:', error);
            next(error);
        }
    }

    forgot = async (req, res, next) => {
        const { email: requestEmail } = req.body;
        if (!requestEmail) return next(ErrorHandler.badRequest());
        if (!validator.isEmail(requestEmail)) return next(ErrorHandler.badRequest('Inavlid Email Address'));
        const user = await userService.findUser({ email: requestEmail });
        if (!user) return next(ErrorHandler.notFound('Invalid Email Address'));
        const { _id: userId, name, email } = user;
        const otp = otpService.generateOtp();
        const type = process.env.TYPE_FORGOT_PASSWORD;
        await otpService.removeOtp(userId);
        await otpService.storeOtp(userId, otp, type);
        await mailService.sendForgotPasswordMail(name, email, otp);
        res.json({ success: true, message: 'Email has been sent to your email address' });
    }

    reset = async (req, res, next) => {
        const { email, otp, password } = req.body;
        if (!email || !otp || !password) return next(ErrorHandler.badRequest());
        const user = await userService.findUser({ email });
        if (!user) return next(ErrorHandler.notFound('No Account Found'));
        const { _id: userId } = user;
        const type = process.env.TYPE_FORGOT_PASSWORD || 2;
        const response = await otpService.verifyOtp(userId, otp, type);
        console.log("Response", response);
        if (response === 'INVALID') return next(ErrorHandler.badRequest('Invalid OTP'));
        if (response === 'EXPIRED') return next(ErrorHandler.badRequest('Otp has been Expired'));
        const { modifiedCount } = await userService.updatePassword(userId, password);
        return modifiedCount === 1 ? res.json({ success: true, message: 'Password has been reset successfully' }) : next(ErrorHandler.serverError('Failed to Reset your password'));
    }

    logout = async (req, res, next) => {
        const { refreshToken } = req.cookies;
        const { _id } = req.user;
        const response = await tokenService.removeRefreshToken(_id, refreshToken);
        await userService.updateUser(_id, { status: 'deactive' });
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        return (response.modifiedCount === 1) ? res.json({ success: true, message: 'Logout Successfully' }) : next(ErrorHandler.unAuthorized());
    }

    refresh = async (req, res, next) => {
        const { refreshToken: refreshTokenFromCookie } = req.cookies;
        if (!refreshTokenFromCookie) return next(ErrorHandler.unAuthorized());
        const userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
        const { _id, email, username, type } = userData;
        const token = await tokenService.findRefreshToken(_id, refreshTokenFromCookie);
        if (!token) {
            res.clearCookie('refreshToken');
            res.clearCookie('accessToken');
            return res.status(401).json({ success: false, message: 'Unauthorized Access' })
        }
        const user = await userService.findUser({ email });
        if (!user) {
            res.clearCookie('refreshToken');
            res.clearCookie('accessToken');
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        if (user?.status === 'banned') return next(ErrorHandler.unAuthorized('Your account has been banned, Please contact to the admin'));
        const payload = {
            _id,
            email,
            username,
            name: user.name,
            type
        }
        const { accessToken, refreshToken } = tokenService.generateToken(payload);
        await tokenService.updateRefreshToken(_id, refreshTokenFromCookie, refreshToken);
        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        })
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        })
        user.status = 'active';
        await user.save();
        res.json({ success: true, message: 'Secure access has been granted', user: new UserDto(user) })
    }

    registerInvited = async (req, res, next) => {
        try {
            const { token, name, password, mobile, fatherName, motherName, presentAddress, permanentAddress, nid, bloodGroup } = req.body;

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

            // Check if user already exists (should not happen if invitation is valid)
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
                address: permanentAddress, // Backup for existing address field

                nid,
                bloodGroup,
                employeeId,
                image,
                status: 'active'
            });

            // Mark invitation as completed
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
    };

}

module.exports = new AuthController();
