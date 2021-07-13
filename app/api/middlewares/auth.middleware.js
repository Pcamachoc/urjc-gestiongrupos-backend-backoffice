// auth.middleware.js

const log = require('../infrastructure/logger/applicationLogger.gateway');
const authService = require('../services/auth.service');
const httpResponseConstants = require('../constants/httpResponse.contants');
const controllerHelper = require('../helpers/controller.helper');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[Auth Middleware]';

// //////////////////////////////////////////////////////////////////////////////
// PRIVATE FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

// Build the condition errors for the controller
function buildConditionErrors() {
  return [{
    errorMsg: authService.ERROR_SECURITY_HEADER_NOT_RECEIVED,
    errorCode: httpResponseConstants.HTTP_AUTHENTICATION_ERROR,
  }, {
    errorMsg: authService.ERROR_TOKEN_NOT_VALID_OR_EXPIRED,
    errorCode: httpResponseConstants.HTTP_AUTHENTICATION_ERROR,
  },
  ];
}

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

function authenticate(req, res, next) {
  try {
    // Receiving parameters
    const securityHeader = req.headers.authorization;
    log.debug(`${MODULE_NAME} ${authenticate.name} (IN) --> securityHeader: <<securityHeader>>`);

    // Call service
    const refreshedToken = authService.authenticateJWTSecurityHeader(securityHeader);

    // Put refreshed token in response
    res.setHeader('authorization', `Bearer ${refreshedToken}`);

    // Go to next step
    log.debug(`${MODULE_NAME} ${authenticate.name} (OUT) --> Token validated Successfullyl!`);
    next();
  } catch (error) {
    controllerHelper.errorHandler(MODULE_NAME, error, res, buildConditionErrors());
  }
}

module.exports = {
  authenticate,
};
