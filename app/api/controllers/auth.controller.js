// auth.controller.js

const log = require('../infrastructure/logger/applicationLogger.gateway');
const httpResponseConstants = require('../constants/httpResponse.contants');
const controllerHelper = require('../helpers/controller.helper');
const configService = require('../services/config.service');
const authService = require('../services/auth.service');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[Auth Controller]';

// //////////////////////////////////////////////////////////////////////////////
// PRIVATE FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

// Build the condition errors for the controller
function buildConditionErrors() {
  return [{
    errorMsg: authService.ERROR_USER_NOT_AUTHENTICATED,
    errorCode: httpResponseConstants.HTTP_AUTHENTICATION_ERROR,
  },
  {
    errorMsg: authService.ERROR_TYPE_OF_AUTHENTICATION_NOT_DEFINED,
    errorCode: httpResponseConstants.HTTP_AUTHENTICATION_ERROR,
  }];
}

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

// Authenticate and get the authentication token
async function authenticate(req, res) {
  try {
    // Receiving req parameters
    const username = controllerHelper.getSwaggerQueryParam(req, 'username');
    const passwd = controllerHelper.getSwaggerQueryParam(req, 'passwd');

    log.info(`${MODULE_NAME}:${authenticate.name} (IN) -> username: ${username}, passwd: <<obfuscated>>`);

    // Build Auth-Credentials
    const authCredentials = { username, passwd };
    // Call service
    const result = await authService.authenticateCredentials(authCredentials, configService.getAuthConfig());

    // Return result
    log.info(`${MODULE_NAME}:${authenticate.name} (OUT) -> result: <<obfuscated>>`);
    res.json(result);
  } catch (error) {
    controllerHelper.errorHandler(MODULE_NAME, error, res, buildConditionErrors());
  }
}

module.exports = {
  authenticate,
};
