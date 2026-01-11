const Problem = require('../models/problem-model');

class ProblemService {
  async createProblem(data) {
    return await Problem.create(data);
  }

  async findProblem(filter) {
    return await Problem.findOne(filter).populate('user', 'name email');
  }

  async findProblems(filter) {
    return await Problem.find(filter).populate('user', 'name email').sort({ createdAt: -1 });
  }

  async updateProblem(id, data) {
    return await Problem.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteProblem(id) {
    return await Problem.findByIdAndDelete(id);
  }
}

module.exports = new ProblemService();
