const serviceService = require('../services/service.service');
const { success, created, notFound } = require('../utils/response');

const getAllServices = async (req, res) => {
  const activeOnly = req.query.all !== 'true';
  const services = await serviceService.getAllServices(req.user?.role === 'OWNER' ? false : activeOnly);
  return success(res, services);
};

const getServiceById = async (req, res) => {
  const service = await serviceService.getServiceById(parseInt(req.params.id));
  return success(res, service);
};

const createService = async (req, res) => {
  const { name, description, price, durationMinutes, imageUrl, includedFeatures, active } = req.body;
  const service = await serviceService.createService({
    name, description, price: parseFloat(price), durationMinutes: parseInt(durationMinutes),
    imageUrl, includedFeatures: includedFeatures || [], active: active !== false,
  });
  return created(res, service, 'Service created successfully');
};

const updateService = async (req, res) => {
  const { name, description, price, durationMinutes, imageUrl, includedFeatures, active } = req.body;
  const service = await serviceService.updateService(parseInt(req.params.id), {
    name, description, price: parseFloat(price), durationMinutes: parseInt(durationMinutes),
    imageUrl, includedFeatures: includedFeatures || [], active: active !== false,
  });
  return success(res, service, 'Service updated successfully');
};

const toggleServiceStatus = async (req, res) => {
  const { active } = req.body;
  const service = await serviceService.toggleServiceStatus(parseInt(req.params.id), active);
  return success(res, service, `Service ${active ? 'activated' : 'deactivated'} successfully`);
};

const deleteService = async (req, res) => {
  const result = await serviceService.deleteService(parseInt(req.params.id));
  const message = result.softDeleted
    ? 'Service deactivated (has existing bookings)'
    : 'Service deleted successfully';
  return success(res, null, message);
};

module.exports = { getAllServices, getServiceById, createService, updateService, toggleServiceStatus, deleteService };
