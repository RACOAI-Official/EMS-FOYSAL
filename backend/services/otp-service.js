const OtpModel = require('../models/otp-model');

class OtpService {
    generateOtp = () => Math.floor(100000 + Math.random() * 900000);

    storeOtp = async (userId, otp, type) => {
        return await OtpModel.create({
            userId,
            otp: Number(otp),
            type: Number(type)
        });
    }

    getOtp = async (userId, type) => {
        const filter = { userId };
        if (typeof type !== 'undefined') {
            filter.type = Number(type);
        }

        return await OtpModel.findOne(filter).sort({ createdAt: -1 });
    }

    removeOtp = async (userId, type) => {
        const filter = { userId };
        if (typeof type !== 'undefined') {
            filter.type = Number(type);
        }

        return await OtpModel.deleteMany(filter);
    }

    verifyOtp = async (userId, otp, type) => {
        const storedOtp = await this.getOtp(userId, type);

        if (!storedOtp) return 'INVALID';

        if (storedOtp.expire < new Date()) {
            return 'EXPIRED';
        }

        if (storedOtp.otp !== Number(otp)) {
            return 'INVALID';
        }

        return 'VALID';
    }
}

module.exports = new OtpService();
