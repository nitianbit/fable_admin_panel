// make bluebird default Promise
/* eslint-disable */
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const { port, env } = require('./config/vars');
const logger = require('./config/logger');
const mongoose = require('./config/mongoose');
const app = require('./config/express');
const bcrypt = require('bcryptjs');
const schedule = require("./api/services/schedule");

// open mongoose connection
mongoose.connect();

const reset = async function(password){
    const hash = await bcrypt.hash(password, 10);
    console.log(hash);
}

reset('Test@123');

schedule.reSchedule();

// listen to requests
app.listen(port, () => logger.info(`server started on port ${port} (${env})`));


/**
 * Exports express
 * @public
 */
module.exports = app;
