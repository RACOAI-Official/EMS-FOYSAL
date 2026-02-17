const tokenService = require('../services/token-service');
const ErrorHandler = require('../utils/error-handler');

const auth = async (req, res, next) => {
    try {
        console.log(`>>> [AuthMiddleware] Authenticating request for ${req.url}`);
            // Accept token from cookie OR Authorization header (Bearer)
            const cookieToken = req.cookies && req.cookies.accessToken;
            const header = req.headers && req.headers.authorization;
            const headerToken = header && header.startsWith('Bearer ') ? header.split(' ')[1] : null;
            const accessToken = cookieToken || headerToken;

            if (!accessToken) return next(ErrorHandler.unAuthorized());

            const userData = await tokenService.verifyAccessToken(accessToken);
        if (!userData) return next(ErrorHandler.unAuthorized());

        req.user = userData;
        next();
    } catch (err) {
        return next(ErrorHandler.unAuthorized());
    }
};

const authRole = (roles) => (req, res, next) => {
    const userType = req.user?.type?.toLowerCase();
    if (!roles.map(r => r.toLowerCase()).includes(userType))
        return next(ErrorHandler.notAllowed());
    next();
};

module.exports = { auth, authRole };
