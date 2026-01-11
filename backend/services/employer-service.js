const EmployerModel = require('../models/employer-model');

class EmpireService {
  createEmpire = async (data) => await EmployerModel.create(data);

  findEmpires = async (filter = {}) => await EmployerModel.find(filter);

  findEmpire = async (filter) => await EmployerModel.findOne(filter);

  updateEmpire = async (id, data) => await EmployerModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });

  deleteEmpire = async (id) => await EmployerModel.findByIdAndDelete(id);

  countEmpires = async (filter = {}) => await EmployerModel.countDocuments(filter);
}

module.exports = new EmpireService();
