const express = require('express');
const {
  createRequest,
  getAllRequests,
  getRequestById,
  updateRequestStatus,
  getRequestLogs,
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { createRequestValidator } = require('../validators/requestValidator');

const router = express.Router();

// All routes here require authentication
router.use(protect);

// GET /api/requests (Manager/Admin only)
// POST /api/requests (User only, checked in controller)
router
  .route('/')
  .post(createRequestValidator, createRequest)
  .get(authorize('Manager', 'Admin'), getAllRequests);

// GET /api/requests/:id
router.route('/:id').get(getRequestById);

// PATCH /api/requests/:id/status
router.route('/:id/status').patch(updateRequestStatus);

// GET /api/requests/:id/logs
router.route('/:id/logs').get(getRequestLogs);

module.exports = router;
