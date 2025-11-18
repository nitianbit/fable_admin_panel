const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createOperator = {
  body: Joi.object().keys({
    companyName: Joi.string().required().trim().min(2).max(100),
    companyCode: Joi.string().required().trim().min(2).max(20).uppercase(),
    businessType: Joi.string().valid('Private', 'Government', 'Semi-Government', 'Cooperative').default('Private'),
    email: Joi.string().email().required().trim().lowercase(),
    phone: Joi.string().required().trim().min(10).max(15),
    countryCode: Joi.string().default("91"),
    alternatePhone: Joi.string().trim().min(10).max(15).allow(''),
    address: Joi.object().keys({
      street: Joi.string().allow(''),
      city: Joi.string().allow(''),
      state: Joi.string().allow(''),
      pincode: Joi.string().allow(''),
      country: Joi.string().default('India')
    }).default({}),
    registrationNumber: Joi.string().required().trim().min(3).max(50),
    gstNumber: Joi.string().trim().min(15).max(15).allow(''),
    panNumber: Joi.string().trim().min(10).max(10).allow(''),
    licenseNumber: Joi.string().required().trim().min(3).max(50),
    licenseExpiryDate: Joi.date().required(),
    contactPerson: Joi.object().keys({
      name: Joi.string().required().trim().min(2).max(50),
      designation: Joi.string().allow(''),
      phone: Joi.string().required().trim().min(10).max(15),
      email: Joi.string().email().required().trim().lowercase()
    }).required(),
    password: Joi.string().min(6).max(128).allow(''),
    status: Joi.string().valid('Active', 'Inactive', 'Suspended', 'Pending').default('Pending'),
    fleetSize: Joi.number().min(0).default(0),
    maxFleetSize: Joi.number().min(1).default(100),
    maxNoOfSeats: Joi.number().min(1).max(100).default(50),
    commissionRate: Joi.number().min(0).max(100).default(0),
    paymentTerms: Joi.string().valid('Daily', 'Weekly', 'Monthly').default('Weekly'),
    description: Joi.string().allow(''),
    website: Joi.string().uri().allow(''),
    socialMedia: Joi.object().keys({
      facebook: Joi.string().uri().allow(''),
      twitter: Joi.string().uri().allow(''),
      instagram: Joi.string().uri().allow(''),
      linkedin: Joi.string().uri().allow('')
    }).default({}),
    documents: Joi.object().keys({
      registrationCertificate: Joi.string().allow(''),
      gstCertificate: Joi.string().allow(''),
      panCard: Joi.string().allow(''),
      licenseDocument: Joi.string().allow(''),
      insuranceDocument: Joi.string().allow(''),
      permitDocument: Joi.string().allow(''),
      logo: Joi.string().allow('')
    }).default({}),
    adminId: Joi.string().custom(objectId).allow(null, '')
  }).unknown(),
};

const listOperators = {
  query: Joi.object().keys({
    global_search: Joi.string().allow(null, ''),
    page: Joi.number().min(1),
    per_page: Joi.number().min(1).max(100),
    companyName: Joi.string(),
    companyCode: Joi.string(),
    businessType: Joi.string().valid('Private', 'Government', 'Semi-Government', 'Cooperative'),
    status: Joi.string().valid('Active', 'Inactive', 'Suspended', 'Pending'),
    isVerified: Joi.boolean(),
    sort: Joi.string(),
    filters: Joi.string()
  }).unknown(),
};

const updateOperator = {
  params: Joi.object().keys({
    operatorId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    companyName: Joi.string().trim().min(2).max(100),
    companyCode: Joi.string().trim().min(2).max(20).uppercase(),
    businessType: Joi.string().valid('Private', 'Government', 'Semi-Government', 'Cooperative'),
    email: Joi.string().email().trim().lowercase(),
    phone: Joi.string().trim().min(10).max(15),
    countryCode: Joi.string(),
    alternatePhone: Joi.string().trim().min(10).max(15).allow(''),
    address: Joi.object().keys({
      street: Joi.string().allow(''),
      city: Joi.string().allow(''),
      state: Joi.string().allow(''),
      pincode: Joi.string().allow(''),
      country: Joi.string()
    }),
    registrationNumber: Joi.string().trim().min(3).max(50),
    gstNumber: Joi.string().trim().min(15).max(15).allow(''),
    panNumber: Joi.string().trim().min(10).max(10).allow(''),
    licenseNumber: Joi.string().trim().min(3).max(50),
    licenseExpiryDate: Joi.date(),
    contactPerson: Joi.object().keys({
      name: Joi.string().trim().min(2).max(50),
      designation: Joi.string().allow(''),
      phone: Joi.string().trim().min(10).max(15),
      email: Joi.string().email().trim().lowercase()
    }),
    password: Joi.string().min(6).max(128).allow(''),
    status: Joi.string().valid('Active', 'Inactive', 'Suspended', 'Pending'),
    fleetSize: Joi.number().min(0),
    maxFleetSize: Joi.number().min(1),
    maxNoOfSeats: Joi.number().min(1).max(100),
    commissionRate: Joi.number().min(0).max(100),
    paymentTerms: Joi.string().valid('Daily', 'Weekly', 'Monthly'),
    description: Joi.string().allow(''),
    website: Joi.string().uri().allow(''),
    socialMedia: Joi.object().keys({
      facebook: Joi.string().uri().allow(''),
      twitter: Joi.string().uri().allow(''),
      instagram: Joi.string().uri().allow(''),
      linkedin: Joi.string().uri().allow('')
    }),
    documents: Joi.object().keys({
      registrationCertificate: Joi.string().allow(''),
      gstCertificate: Joi.string().allow(''),
      panCard: Joi.string().allow(''),
      licenseDocument: Joi.string().allow(''),
      insuranceDocument: Joi.string().allow(''),
      permitDocument: Joi.string().allow(''),
      logo: Joi.string().allow('')
    }),
    adminId: Joi.string().custom(objectId)
  }).unknown(),
};

const deleteOperator = {
  params: Joi.object().keys({
    operatorId: Joi.string().custom(objectId),
  }),
};

const verifyOperator = {
  params: Joi.object().keys({
    operatorId: Joi.required().custom(objectId),
  }),
};

const changeStatus = {
  params: Joi.object().keys({
    operatorId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('Active', 'Inactive', 'Suspended', 'Pending').required(),
  }),
};

const uploadDocument = {
  params: Joi.object().keys({
    operatorId: Joi.required().custom(objectId),
    documentType: Joi.string().valid(
      'registrationCertificate',
      'gstCertificate',
      'panCard',
      'licenseDocument',
      'insuranceDocument',
      'permitDocument',
      'logo'
    ).required(),
  }),
};

const isOperatorExists = {
  body: Joi.object().keys({
    email: Joi.string().email().allow(''),
    companyCode: Joi.string().allow(''),
    registrationNumber: Joi.string().allow(''),
  }).or('email', 'companyCode', 'registrationNumber'),
};

module.exports = {
  // GET /v1/operators
  listOperators,
  // POST /v1/operators
  createOperator,
  // PATCH /v1/operators/:operatorId
  updateOperator,
  // DELETE /v1/operators/:operatorId
  deleteOperator,
  // POST /v1/operators/is-exists
  isOperatorExists,
  // PATCH /v1/operators/:operatorId/verify
  verifyOperator,
  // PATCH /v1/operators/:operatorId/status
  changeStatus,
  // PATCH /v1/operators/:operatorId/:documentType
  uploadDocument,
};
