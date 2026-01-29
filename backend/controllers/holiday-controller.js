const Holiday = require('../models/holiday-model');
const ErrorHandler = require('../utils/error-handler');

class HolidayController {
  createHoliday = async (req, res, next) => {
    try {
      const { name, date, month, year, type } = req.body;
      if (!name || !date || !month || !year) {
        return next(ErrorHandler.badRequest('Name, date, month, and year are required'));
      }

      const holiday = await Holiday.create({ name, date, month, year, type });
      res.json({ success: true, message: 'Holiday created successfully', data: holiday });
    } catch (error) {
      next(error);
    }
  }

  getHolidays = async (req, res, next) => {
    try {
      const { year } = req.query;
      const query = year ? { year: Number(year) } : {};
      const holidays = await Holiday.find(query).sort({ month: 1, date: 1 });
      res.json({ success: true, data: holidays });
    } catch (error) {
      next(error);
    }
  }

  deleteHoliday = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await Holiday.findByIdAndDelete(id);
      if (!result) return next(ErrorHandler.notFound('Holiday not found'));
      res.json({ success: true, message: 'Holiday deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HolidayController();
