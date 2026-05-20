const Request = require('../models/Request');
const RequestLog = require('../models/RequestLog');
const { validateTransition } = require('../services/workflowService');


const createRequest = async (req, res, next) => {
  const { title, description, category, priority } = req.body;

  try {
    if (req.user.role !== 'User') {
      return res.status(403).json({
        success: false,
        error: 'Only Users can create requests',
      });
    }

    const request = await Request.create({
      title,
      description,
      category,
      priority,
      status: 'Submitted',
      user_id: req.user.id,
    });

    await RequestLog.create({
      request_id: request._id,
      old_status: null,
      new_status: 'Submitted',
      changed_by: req.user.id,
      role: req.user.role,
      comment: 'Request created and submitted.',
    });

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};


const getAllRequests = async (req, res, next) => {
  try {
    const { status, category, priority, search, page = 1, limit = 10 } = req.query;

    const query = {};

  
    if (status) {
      query.status = status;
    }
    if (category) {
      query.category = category;
    }
    if (priority) {
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

   
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Request.countDocuments(query);
    const requests = await Request.find(query)
      .populate('user_id', 'name email role')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: requests.length,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};


const getMyRequests = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const query = { user_id: req.user.id };

    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Request.countDocuments(query);
    const requests = await Request.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: requests.length,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};


const getRequestById = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id).populate(
      'user_id',
      'name email role'
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
      });
    }

    if (req.user.role === 'User' && request.user_id._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this request',
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};


const updateRequestStatus = async (req, res, next) => {
  const { status: targetStatus, comment } = req.body;

  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
      });
    }

    const validation = validateTransition(request.status, targetStatus, req.user.role);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.message,
      });
    }

    const oldStatus = request.status;
    request.status = targetStatus;
    await request.save();

    await RequestLog.create({
      request_id: request._id,
      old_status: oldStatus,
      new_status: targetStatus,
      changed_by: req.user.id,
      role: req.user.role,
      comment: comment || `Status updated from ${oldStatus} to ${targetStatus}`,
    });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

const getRequestLogs = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
      });
    }

    if (req.user.role === 'User' && request.user_id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view logs for this request',
      });
    }

    const logs = await RequestLog.find({ request_id: req.params.id })
      .populate('changed_by', 'name email role')
      .sort({ timestamp: 1 }); 

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  getMyRequests,
  getRequestById,
  updateRequestStatus,
  getRequestLogs,
};
