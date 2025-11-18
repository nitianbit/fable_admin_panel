const express = require('express');
const Validate = require('../../middlewares/validator');
const controller = require('../../controllers/bustype.controller');
const { getAuth } = require('../../middlewares/auth');
const { bustypeValidation } = require('../../validations');

const router = express.Router();

router
  .route('/')
  .get(getAuth('master.admin', 'operator'), controller.load)
  .post(
    getAuth('bus.type.create', 'master.admin', 'operator'),
    Validate(bustypeValidation.createBusTypes),
    controller.create,
  );

router
  .route('/search')
  .get(
    getAuth('bus.type.view', 'master.admin', 'operator'),
    Validate(bustypeValidation.listBusTypes),
    controller.list,
  );

router
  .route('/:bustypeId')

  .get(
    getAuth('bus.type.edit', 'master.admin', 'operator'),
    Validate(bustypeValidation.getBusTypes),
    controller.get,
  )
  /**
   * update the single location
   * */
  .patch(
    getAuth('bus.type.edit', 'master.admin', 'operator'),
    Validate(bustypeValidation.updateBusTypes),
    controller.update,
  )
  /**
   * delete  the single location
   * */

  .delete(
    getAuth('bus.type.delete', 'master.admin', 'operator'),
    Validate(bustypeValidation.deleteBusTypes),
    controller.remove,
  );

module.exports = router;
