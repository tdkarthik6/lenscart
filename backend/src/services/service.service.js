const serviceRepository = require('../repositories/service.repository');

class ServiceService {
  async getAllServices(activeOnly = true) {
    return serviceRepository.findAll(activeOnly);
  }

  async getServiceById(id) {
    const service = await serviceRepository.findById(id);
    if (!service) {
      const err = new Error('Service not found.');
      err.statusCode = 404;
      throw err;
    }
    return service;
  }

  async createService(data) {
    return serviceRepository.create(data);
  }

  async updateService(id, data) {
    const existing = await serviceRepository.findById(id);
    if (!existing) {
      const err = new Error('Service not found.');
      err.statusCode = 404;
      throw err;
    }
    return serviceRepository.update(id, data);
  }

  async toggleServiceStatus(id, active) {
    const existing = await serviceRepository.findById(id);
    if (!existing) {
      const err = new Error('Service not found.');
      err.statusCode = 404;
      throw err;
    }
    return serviceRepository.updateStatus(id, active);
  }

  async deleteService(id) {
    const existing = await serviceRepository.findById(id);
    if (!existing) {
      const err = new Error('Service not found.');
      err.statusCode = 404;
      throw err;
    }
    return serviceRepository.delete(id);
  }
}

module.exports = new ServiceService();
