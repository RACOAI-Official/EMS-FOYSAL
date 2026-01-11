const mongoose = require('mongoose');
const ErrorHandler = require('../utils/error-handler');
const progressService = require('../services/progress-service');

class ProgressController {
    submitSelfProgress = async (req,res,next) => {
        try {
            if(!['employee','leader'].includes(req.user.type)) {
                return next(ErrorHandler.unAuthorized('Only employees or leaders can submit progress'));
            }
            let { progress, progressNote } = req.body;
            if(progress === undefined || progress === null) {
                return next(ErrorHandler.badRequest('Progress value is required'));
            }
            progress = Number(progress);
            if(Number.isNaN(progress) || progress < 0 || progress > 100) {
                return next(ErrorHandler.badRequest('Progress must be between 0 and 100'));
            }
            const doc = await progressService.upsertForUser(req.user._id, progress, progressNote);
            return res.json({ success:true, message:'Progress saved', data: doc });
        } catch (error) {
            return next(ErrorHandler.serverError(error.message));
        }
    }

    getSelfProgress = async (req,res,next) => {
        try {
            if(!['employee','leader'].includes(req.user.type)) {
                return next(ErrorHandler.unAuthorized('Only employees or leaders can view their progress'));
            }
            const data = await progressService.getForUser(req.user._id);
            return res.json({ success:true, data });
        } catch (error) {
            return next(ErrorHandler.serverError(error.message));
        }
    }

    getAllProgress = async (req,res,next) => {
        try {
            if(req.user.type !== 'admin') {
                return next(ErrorHandler.unAuthorized('Only admins can view all progress'));
            }
            const data = await progressService.getAll();
            return res.json({ success:true, data });
        } catch (error) {
            return next(ErrorHandler.serverError(error.message));
        }
    }
}

module.exports = new ProgressController();
