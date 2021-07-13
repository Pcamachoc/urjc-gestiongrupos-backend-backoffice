// app.js

const log = require('./api/infrastructure/logger/applicationLogger.gateway');
const loggingBootstrap = require('./api/bootstrap/logging.bootstrap');
const configBootstrap = require('./api/bootstrap/config.bootstrap');
const jwtBootstrap = require('./api/bootstrap/jwt.bootstrap');
const swaggerExpressBootstrap = require('./api/bootstrap/swaggerExpress.bootstrap');
const mongooseBootstrap = require('./api/bootstrap/mongoose.bootstrap');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[App]';
const appRoot = __dirname;

// //////////////////////////////////////////////////////////////////////////////
// PRIVATE FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

function buildInitConfigOptions() {
  const options = {
    source: process.env.NODE_CONFIG_SOURCE_APP,
    springcfgendpoint: process.env.NODE_CONFIG_SPRINGCFG_ENDPOINT,
    filename: process.env.NODE_CONFIG_FILE,
    port: process.env.NODE_CONFIG_PORT_APP,
  };

  return options;
}

function logAppStarted(functionName) {
  log.info(`${MODULE_NAME} ${functionName}`);
  log.info(`${MODULE_NAME} ${functionName} -------------------------------------------------------------------------`);
  log.info(`${MODULE_NAME} ${functionName} --                         App Initialized OK!                         --`);
  log.info(`${MODULE_NAME} ${functionName} -------------------------------------------------------------------------`);
}

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function init() {
  try {
    // 1. Logging Default Init
    loggingBootstrap.defaultInit();
    log.info(`${MODULE_NAME}:${init.name} (IN) --> Application starting...`);

    // 2. Config Init
    const initCfgOptions = buildInitConfigOptions();
    log.info(`${MODULE_NAME}:${init.name} (MID) --> initCfgOptions: ${JSON.stringify(initCfgOptions)}`);
    await configBootstrap.init(initCfgOptions);

    // 3. Logging init
    loggingBootstrap.init();

    // 4. JWT Infrastructure init
    jwtBootstrap.init();

    // 5. SwaggerExpress Server init
    await swaggerExpressBootstrap.init(appRoot, initCfgOptions.port);

    // 6. Mongoose init
    await mongooseBootstrap.init();

    logAppStarted(init.name);
    return true;
  } catch (error) {
    log.error(`${MODULE_NAME}:${init.name} (ERROR) --> error: ${error.message}`);
    log.error(`${MODULE_NAME}:${init.name} (ERROR) --> error: ${error.stack}`);
    return false;
  }
}

process.on('unhandledRejection', (err, p) => {
  log.error(`${MODULE_NAME} (ERROR) --> An unhandledRejection occurred...`);
  log.error(`${MODULE_NAME} (ERROR) --> Rejected Promise: ${p}`);
  log.error(`${MODULE_NAME} (ERROR) --> Rejection: ${err}`);
});

module.exports = {
  init,
};

require('make-runnable');
