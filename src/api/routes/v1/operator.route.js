const express = require('express');
const Validate = require('../../middlewares/validator');
const controller = require('../../controllers/operator.controller');
const {
  authorize,
  getAuth,
  LOGGED_USER,
} = require('../../middlewares/auth');
const { operatorValidation } = require('../../validations');

const multer = require('multer');

const upload = multer({});

const router = express.Router();

// Check if operator exists
router
  .route('/is-exists')
  .post(controller.isOperatorExists);


router
  .route('/')
  .get(getAuth('operator.load', 'master.admin'), controller.load)
  .post(getAuth('operator.create', 'master.admin'), Validate(operatorValidation.createOperator), controller.create);

// Search/list operators with pagination
router
  .route('/search')
  .get(getAuth('operator.view', 'master.admin'), Validate(operatorValidation.listOperators), controller.list);

// Get single operator
router
  .route('/:operatorId')
  .get(getAuth('operator.edit', 'master.admin'), controller.get)
  .patch(getAuth('operator.edit', 'master.admin'), Validate(operatorValidation.updateOperator), controller.update)
  .delete(getAuth('operator.delete', 'master.admin'), Validate(operatorValidation.deleteOperator), controller.remove);

// Verify operator
router
  .route('/:operatorId/verify')
  .patch(getAuth('operator.edit', 'master.admin'), Validate(operatorValidation.verifyOperator), controller.verify);

// Change operator status
router
  .route('/:operatorId/status')
  .patch(getAuth('operator.edit', 'master.admin'), Validate(operatorValidation.changeStatus), controller.changeStatus);

// Upload operator document
router
  .route('/:operatorId/:documentType')
  .patch(getAuth('operator.edit', 'master.admin'), Validate(operatorValidation.uploadDocument), upload.single('pic'), controller.uploadDocument);

module.exports = router;
