const httpStatus = require("http-status");
const { omit, isEmpty } = require("lodash");
const Operator = require("../models/Operator.model");
const { imageDelete, imageUpload } = require("../services/uploaderService");
const uuidv4 = require("uuid/v4");

 
exports.isOperatorExists = async (req, res, next) => {
  try {
    const { email, companyCode, registrationNumber } = req.body;
    const isExists = await Operator.countDocuments({
      $or: [
        { email: email },
        { companyCode: companyCode },
        { registrationNumber: registrationNumber },
      ],
    });

    if (isExists && isExists > 0) {
      res.status(httpStatus.OK);
      res.json({
        status: false,
        message: "Operator with this email, company code, or registration number already exists",
      });
    } else {
      res.status(httpStatus.OK);
      res.json({
        status: true,
        message: "Operator details are available",
      });
    }
  } catch (error) {
    return next(error);
  }
};

 
exports.load = async (req, res, next) => {
  try {
    const operators = await Operator.find({ 
      status: { $in: ['Active', 'Pending'] }, 
      isDeleted: false 
    }).select('companyName companyCode email phone status');
    
    res.status(httpStatus.OK);
    res.json({
      message: 'Operators loaded successfully.',
      data: operators.map(operator => ({
        id: operator._id,
        name: operator.companyName,
        code: operator.companyCode,
        email: operator.email,
        phone: operator.phone,
        status: operator.status
      })),
      status: true,
    });
  } catch (error) {
    return next(error);
  }
};

 
exports.get = async (req, res, next) => {
  try {
    const operator = await Operator.findById(req.params.operatorId);
    
    if (!operator) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: "Operator not found",
        status: false,
      });
    }

    res.status(httpStatus.OK);
    res.json({
      message: "Operator fetched successfully.",
      data: operator.transform(),
      status: true,
    });
  } catch (error) {
    return next(error);
  }
};
 
exports.uploadDocument = async (req, res, next) => {
  try {
    const { operatorId, documentType } = req.params;
    
    if (!req.file) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "No file to upload.",
        status: false,
      });
    } else if (req.file.size > 5000000) { // 5MB size limit
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "File size limit is 5MB.",
        status: false,
      });
    }

    const FolderName = process.env.S3_BUCKET_OPERATOR || "operators";
    const base64Image = req.file.buffer.toString("base64");
    const base64 = `data:${req.file.mimetype};base64,${base64Image}`;
    const s3Dataurl = await imageUpload(
      base64,
      `${operatorId}-${documentType}`,
      FolderName
    );

    if (s3Dataurl) {
      const updateField = `documents.${documentType}`;
      const update = {
        [updateField]: s3Dataurl,
      };

      await Operator.updateOne(
        { _id: operatorId },
        { $set: update }
      );

      res.status(httpStatus.OK);
      res.json({
        message: "Operator document uploaded successfully.",
        data: { documentType, pathUrl: s3Dataurl },
        status: true,
      });
    } else {
      res.status(httpStatus.INTERNAL_SERVER_ERROR);
      res.json({
        message: "Document upload failed.",
        status: false,
      });
    }
  } catch (error) {
    next(error);
  }
};

 
exports.create = async (req, res, next) => {
  try {
    const {
      companyName,
      companyCode,
      businessType,
      email,
      phone,
      countryCode,
      alternatePhone,
      address,
      registrationNumber,
      gstNumber,
      panNumber,
      licenseNumber,
      licenseExpiryDate,
      contactPerson,
      roleId,
      password,
      status,
      fleetSize,
      maxFleetSize,
      maxNoOfSeats,
      commissionRate,
      paymentTerms,
      description,
      website,
      socialMedia,
      documents,
    } = req.body;

    const FolderName = process.env.S3_BUCKET_OPERATOR || "operators";
    const objOperator = {
      companyName,
      companyCode,
      businessType,
      email,
      phone,
      countryCode,
      alternatePhone,
      address,
      registrationNumber,
      gstNumber,
      panNumber,
      licenseNumber,
      licenseExpiryDate,
      contactPerson,
      roleId: roleId || null,
      status,
      fleetSize,
      maxFleetSize,
      maxNoOfSeats,
      commissionRate,
      paymentTerms,
      description,
      website,
      socialMedia,
    };

    // Handle password if provided
    if (password) {
      objOperator.password = password;
    }

    // Handle document uploads
    if (documents) {
      const documentFields = [
        'registrationCertificate',
        'gstCertificate', 
        'panCard',
        'licenseDocument',
        'insuranceDocument',
        'permitDocument',
        'logo'
      ];

      objOperator.documents = {};
      
      for (const field of documentFields) {
        if (documents[field]) {
          objOperator.documents[field] = await imageUpload(
            documents[field],
            `${uuidv4()}-${field}`,
            FolderName
          );
        } else {
          objOperator.documents[field] = field === 'logo' ? 'default.jpg' : '';
        }
      }
    } else {
      objOperator.documents = {
        registrationCertificate: '',
        gstCertificate: '',
        panCard: '',
        licenseDocument: '',
        insuranceDocument: '',
        permitDocument: '',
        logo: 'default.jpg'
      };
    }

    const operator = new Operator(objOperator);
    const savedOperator = await operator.save();

    res.status(httpStatus.CREATED);
    return res.json({
      message: 'Operator created successfully.',
      data: savedOperator.transform(),
      status: true,
    });
  } catch (error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      if (error.keyPattern.email) {
        return res.status(httpStatus.CONFLICT).json({
          message: 'Email already exists',
          status: false,
        });
      } else if (error.keyPattern.companyCode) {
        return res.status(httpStatus.CONFLICT).json({
          message: 'Company code already exists',
          status: false,
        });
      } else if (error.keyPattern.registrationNumber) {
        return res.status(httpStatus.CONFLICT).json({
          message: 'Registration number already exists',
          status: false,
        });
      }
    }
    next(error);
  }
};


exports.update = async (req, res, next) => {
  try {
    const operatorExists = await Operator.findById(req.params.operatorId);
    
    if (!operatorExists) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: "Operator not found",
        status: false,
      });
    }

    const FolderName = process.env.S3_BUCKET_OPERATOR || "operators";
    
    // Only include fields that are provided in the request
    const allowedFields = [
      'companyName', 'companyCode', 'businessType', 'email', 'phone',
      'countryCode', 'alternatePhone', 'address', 'registrationNumber',
      'gstNumber', 'panNumber', 'licenseNumber', 'licenseExpiryDate',
      'contactPerson', 'status', 'fleetSize', 'maxFleetSize', 'roleId',
      'maxNoOfSeats', 'commissionRate', 'paymentTerms', 'description',
      'website', 'socialMedia'
    ];
    
    const objUpdate = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        objUpdate[field] = req.body[field];
      }
    });

    // Handle password update
    if (req.body.password) {
      objUpdate.password = req.body.password;
    }

    // Handle document updates
    if (req.body.documents) {
      const documentFields = [
        'registrationCertificate',
        'gstCertificate',
        'panCard', 
        'licenseDocument',
        'insuranceDocument',
        'permitDocument',
        'logo'
      ];

      for (const field of documentFields) {
        if (req.body.documents[field] && Operator.isValidBase64 && Operator.isValidBase64(req.body.documents[field])) {
          // Delete old document if exists
          if (operatorExists.documents && operatorExists.documents[field]) {
            await imageDelete(operatorExists.documents[field], FolderName);
          }
          
          objUpdate[`documents.${field}`] = await imageUpload(
            req.body.documents[field],
            `${uuidv4()}-${field}`,
            FolderName
          );
        }
      }
    }

    const updatedOperator = await Operator.findByIdAndUpdate(
      req.params.operatorId,
      { $set: objUpdate },
      { new: true }
    );

    res.status(httpStatus.OK);
    res.json({
      status: true,
      message: "Operator updated successfully.",
      data: updatedOperator.transform(),
    });
  } catch (error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      if (error.keyPattern.email) {
        return res.status(httpStatus.CONFLICT).json({
          message: 'Email already exists',
          status: false,
        });
      } else if (error.keyPattern.companyCode) {
        return res.status(httpStatus.CONFLICT).json({
          message: 'Company code already exists',
          status: false,
        });
      } else if (error.keyPattern.registrationNumber) {
        return res.status(httpStatus.CONFLICT).json({
          message: 'Registration number already exists',
          status: false,
        });
      }
    }
    next(error);
  }
};


exports.list = async (req, res, next) => {
  try {
    let condition = req.query.global_search && req.query.global_search.trim()
      ? {
          $and: [
            { isDeleted: false },
            {
              $or: [
                {
                  companyName: {
                    $regex: new RegExp(req.query.global_search.trim()),
                    $options: "i",
                  },
                },
                {
                  companyCode: {
                    $regex: new RegExp(req.query.global_search.trim()),
                    $options: "i",
                  },
                },
                {
                  email: {
                    $regex: new RegExp(req.query.global_search.trim()),
                    $options: "i",
                  },
                },
                {
                  phone: {
                    $regex: new RegExp(req.query.global_search.trim()),
                    $options: "i",
                  },
                },
                {
                  registrationNumber: {
                    $regex: new RegExp(req.query.global_search.trim()),
                    $options: "i",
                  },
                },
                {
                  'contactPerson.name': {
                    $regex: new RegExp(req.query.global_search.trim()),
                    $options: "i",
                  },
                },
              ],
            },
          ],
        }
      : { isDeleted: false };

    let sort = { createdAt: -1 }; // Default sort
    if (req.query.sort) {
      try {
        const data = JSON.parse(req.query.sort);
        if (data.name && data.order) {
          sort = { [data.name]: data.order !== "none" ? data.order : "asc" };
        }
      } catch (error) {
        console.log('Invalid sort parameter, using default sort');
        sort = { createdAt: -1 };
      }
    }

    if (req.query.filters) {
      try {
        const filtersData = JSON.parse(req.query.filters);
        if (filtersData.type === "simple") {
          condition = {
            ...condition,
            [filtersData.name]: filtersData.text,
          };
        } else if (filtersData.type === "select") {
          condition = {
            ...condition,
            [filtersData.name]: { $in: filtersData.selected_options },
          };
        }
      } catch (error) {
        console.log('Invalid filters parameter, ignoring filters');
      }
    }

    const aggregateQuery = Operator.aggregate([
      {
        $match: condition,
      },
      {
        $project: {
          _id: 1,
          companyName: 1,
          companyCode: 1,
          businessType: 1,
          email: 1,
          phone: 1,
          countryCode: 1,
          registrationNumber: 1,
          licenseNumber: 1,
          licenseExpiryDate: 1,
          contactPerson: 1,
          status: 1,
          isVerified: 1,
          fleetSize: 1,
          maxFleetSize: 1,
          maxNoOfSeats: 1,
          commissionRate: 1,
          paymentTerms: 1,
          createdAt: 1,
          updatedAt: 1,
        }
      },
    ]);

    const options = {
      page: req.query.page || 1,
      limit: req.query.per_page || 10,
      collation: { locale: "en" },
      customLabels: {
        totalDocs: "totalRecords",
        docs: "operators",
      },
      sort,
    };

    try {
      const result = await Operator.aggregatePaginate(aggregateQuery, options);
      res.json({ data: result });
    } catch (aggregateError) {
      console.error('Aggregate pagination error:', aggregateError);
      // Fallback to regular pagination if aggregate pagination fails
      const fallbackResult = await Operator.paginate(condition, {
        page: req.query.page || 1,
        limit: req.query.per_page || 10,
        sort: sort,
        select: 'companyName companyCode businessType email phone countryCode registrationNumber licenseNumber licenseExpiryDate contactPerson status isVerified fleetSize maxFleetSize maxNoOfSeats commissionRate paymentTerms createdAt updatedAt'
      });
      res.json({ data: fallbackResult });
    }
  } catch (error) {
    next(error);
  }
};

 
exports.remove = async (req, res, next) => {
  try {
    const operatorExists = await Operator.findById(req.params.operatorId);
    
    if (!operatorExists) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: "Operator not found",
        status: false,
      });
    }

    // Check if operator has any buses assigned
    const Bus = require("../models/bus.model");
    const hasBuses = await Bus.countDocuments({ operatorId: req.params.operatorId });
    
    if (hasBuses > 0) {
      return res.status(httpStatus.CONFLICT).json({
        message: "Cannot delete operator. Please remove all assigned buses first.",
        status: false,
      });
    }

    // Soft delete by setting isDeleted to true
    const deletedOperator = await Operator.findByIdAndUpdate(
      req.params.operatorId,
      { 
        $set: { 
          isDeleted: true,
          status: 'Inactive'
        } 
      },
      { new: true }
    );

    res.status(httpStatus.OK).json({
      status: true,
      message: 'Operator deleted successfully.',
      data: deletedOperator.transform(),
    });
  } catch (error) {
    next(error);
  }
};

 
exports.verify = async (req, res, next) => {
  try {
    const operator = await Operator.findById(req.params.operatorId);
    
    if (!operator) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: "Operator not found",
        status: false,
      });
    }

    const updatedOperator = await Operator.findByIdAndUpdate(
      req.params.operatorId,
      { 
        $set: { 
          isVerified: true,
          verifiedAt: new Date(),
          status: 'Active'
        } 
      },
      { new: true }
    );

    res.status(httpStatus.OK).json({
      status: true,
      message: 'Operator verified successfully.',
      data: updatedOperator.transform(),
    });
  } catch (error) {
    next(error);
  }
};

 
exports.changeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Active', 'Inactive', 'Suspended', 'Pending'];
    
    if (!validStatuses.includes(status)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Invalid status. Must be one of: Active, Inactive, Suspended, Pending",
        status: false,
      });
    }

    const operator = await Operator.findById(req.params.operatorId);
    
    if (!operator) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: "Operator not found",
        status: false,
      });
    }

    const updatedOperator = await Operator.findByIdAndUpdate(
      req.params.operatorId,
      { $set: { status } },
      { new: true }
    );

    res.status(httpStatus.OK).json({
      status: true,
      message: `Operator status changed to ${status} successfully.`,
      data: updatedOperator.transform(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get operator profile (for logged-in operator)
 * @public
 */
exports.getOperatorProfile = async (req, res, next) => {
  try {
    const operator = req.operator; // Set by operatorAuth middleware
    
    res.status(httpStatus.OK).json({
      message: "Operator profile fetched successfully.",
      data: operator.transform(),
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update operator profile (for logged-in operator)
 * @public
 */
exports.updateOperatorProfile = async (req, res, next) => {
  try {
    const operator = req.operator; // Set by operatorAuth middleware
    const FolderName = process.env.S3_BUCKET_OPERATOR || "operators";
    
    // Allow all fields except admin-controlled ones (status, isVerified, isDeleted, roleId)
    const allowedFields = [
      'companyName', 'companyCode', 'businessType', 'email', 'phone',
      'countryCode', 'alternatePhone', 'address', 'registrationNumber',
      'gstNumber', 'panNumber', 'licenseNumber', 'licenseExpiryDate',
      'contactPerson', 'fleetSize', 'maxFleetSize', 'maxNoOfSeats',
      'commissionRate', 'paymentTerms', 'description', 'website',
      'socialMedia', 'deviceToken', 'deviceType', 'deviceId', 'deviceInfo',
      'language'
    ];
    
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Handle password update
    if (req.body.password) {
      updateData.password = req.body.password;
    }

    // Handle document updates
    if (req.body.documents) {
      const documentFields = [
        'registrationCertificate',
        'gstCertificate',
        'panCard', 
        'licenseDocument',
        'insuranceDocument',
        'permitDocument',
        'logo'
      ];

      for (const field of documentFields) {
        if (req.body.documents[field]) {
          // Check if it's a base64 string (starts with data:image or is a valid base64)
          const isBase64 = typeof req.body.documents[field] === 'string' && 
            (req.body.documents[field].startsWith('data:image') || 
             req.body.documents[field].startsWith('data:application') ||
             /^data:[a-zA-Z0-9]+\/[a-zA-Z0-9]+;base64,/.test(req.body.documents[field]));
          
          if (isBase64) {
            // Delete old document if exists
            if (operator.documents && operator.documents[field]) {
              await imageDelete(operator.documents[field], FolderName);
            }
            
            updateData[`documents.${field}`] = await imageUpload(
              req.body.documents[field],
              `${uuidv4()}-${field}`,
              FolderName
            );
          }
        }
      }
    }

    const updatedOperator = await Operator.findByIdAndUpdate(
      operator._id,
      { $set: updateData },
      { new: true }
    );

    res.status(httpStatus.OK).json({
      status: true,
      message: "Operator profile updated successfully.",
      data: updatedOperator.transform(),
    });
  } catch (error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      if (error.keyPattern.email) {
        return res.status(httpStatus.CONFLICT).json({
          message: 'Email already exists',
          status: false,
        });
      } else if (error.keyPattern.companyCode) {
        return res.status(httpStatus.CONFLICT).json({
          message: 'Company code already exists',
          status: false,
        });
      } else if (error.keyPattern.registrationNumber) {
        return res.status(httpStatus.CONFLICT).json({
          message: 'Registration number already exists',
          status: false,
        });
      }
    }
    next(error);
  }
};

/**
 * Get operator dashboard data
 * @public
 */
exports.getOperatorDashboard = async (req, res, next) => {
  try {
    const operator = req.operator; // Set by operatorAuth middleware
    
    // Get basic operator stats
    const Bus = require("../models/bus.model");
    const totalBuses = await Bus.countDocuments({ operatorId: operator._id });
    const activeBuses = await Bus.countDocuments({ 
      operatorId: operator._id, 
      status: true 
    });

    const dashboardData = {
      operator: operator.transform(),
      stats: {
        totalBuses,
        activeBuses,
        fleetSize: operator.fleetSize,
        maxFleetSize: operator.maxFleetSize,
        maxNoOfSeats: operator.maxNoOfSeats,
        commissionRate: operator.commissionRate,
        paymentTerms: operator.paymentTerms,
      },
      recentActivity: [], // You can add recent activity logic here
    };

    res.status(httpStatus.OK).json({
      message: "Operator dashboard data fetched successfully.",
      data: dashboardData,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};
