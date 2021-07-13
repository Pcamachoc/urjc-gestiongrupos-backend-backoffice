// swaggerExpress.infra.js

const cors = require('cors');
const express = require('express');
const SwaggerExpress = require('swagger-express-mw');

const log = require('../infrastructure/logger/applicationLogger.gateway');
const securityHelper = require('../helpers/security.helper');
const uploaderHelper = require('../helpers/uploader.helper');
const authMiddleware = require('../middlewares/auth.middleware');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[SwaggerExpress Infra]';

const DEFAULT_PORT = 10011;
const DEFAULT_TIMEOUT = 50000;

// //////////////////////////////////////////////////////////////////////////////
// PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

let server;

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC METHODS
// //////////////////////////////////////////////////////////////////////////////

// Start Express Server, configuring healthcheck, private routing and Install Middleware
async function start(options) {
  return new Promise((resolve, reject) => {
    try {
      log.info(`${MODULE_NAME} ${start.name} (IN) --> options: ${JSON.stringify(options)}`);

      // Swagger config
      const config = {
        appRoot: options.appRoot,
      };

      // Instance Expresss
      const app = express();

      // Init Security
      securityHelper.initSecurity(app);

      // Init Swagger
      SwaggerExpress.create(config, (err, swaggerExpress) => {
        if (err) {
          log.error(`${MODULE_NAME} ${start.name} (ERROR) --> error: ${err.stack}`);
          throw err;
        }

        const appPort = options.port || DEFAULT_PORT;
        module.exports.server = app.listen(appPort);

        // Socket timeout to 5 minutes
        module.exports.server.timeout = 300000;

        // Set the requests timeout
        const serverTimeOut = options.servertimeout || DEFAULT_TIMEOUT;
        module.exports.server.setTimeout(serverTimeOut);
        log.info(`${MODULE_NAME} ${start.name} (MID) --> Express Server timeout set to: ${serverTimeOut} ms`);

        // Init Uploader
        uploaderHelper.initUploader(options.upload, app);

        // Enable private routes
        if (options.privateRouting.enabled) {
          log.info(`${MODULE_NAME} ${start.name} (MID) --> Enabling private routes at: ${JSON.stringify(options.privateRouting.routes)}`);

          options.privateRouting.routes.map(x => app.all(x.route, authMiddleware.authenticate));
        }

        // Enable CORS
        if (options.enableCors) {
          log.info(`${MODULE_NAME} ${start.name} (MID) --> Enabling CORS`);
          app.use(cors());
        }
        // Install middleware
        swaggerExpress.register(app);

        log.info(`${MODULE_NAME} ${start.name} (OUT) --> App Server started at port: ${appPort} and Running OK!`);

        resolve(true);
      });
    } catch (error) {
      log.error(`${MODULE_NAME} ${start.name} (ERROR) --> error: ${error.stack}`);
      reject(new Error('Express did not start correctly!'));
    }
  });
}

function stop() {
  log.info(`${MODULE_NAME} ${stop.name} (IN) --> no params`);

  module.exports.server.close(() => { log.info(`${MODULE_NAME} ${stop.name} (OUT) --> App Server stopped`); });
}

module.exports = {
  server,
  start,
  stop,
};
