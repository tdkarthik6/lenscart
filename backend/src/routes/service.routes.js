const express = require('express');
const router = express.Router();
const {
  getAllServices, getServiceById, createService, updateService, toggleServiceStatus, deleteService
} = require('../controllers/service.controller');
const authenticate = require('../middleware/authenticate');
const requireOwner = require('../middleware/requireOwner');

// Public
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Owner only
router.post('/', authenticate, requireOwner, createService);
router.put('/:id', authenticate, requireOwner, updateService);
router.patch('/:id/status', authenticate, requireOwner, toggleServiceStatus);
router.delete('/:id', authenticate, requireOwner, deleteService);

module.exports = router;
