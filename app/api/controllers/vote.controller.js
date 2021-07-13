// vote.controller.js
const log = require('../infrastructure/logger/applicationLogger.gateway');
const httpResponseConstants = require('../constants/httpResponse.contants');
const controllerHelper = require('../helpers/controller.helper');
const voteService = require('../services/vote.service');
const authService = require('../services/auth.service');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[Vote Controller]';
const MIME_TYPE_CSV = 'text/csv';

// //////////////////////////////////////////////////////////////////////////////
// PRIVATE FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

// Build the condition errors for the controller
function buildConditionErrors() {
  return [{
    errorMsg: authService.ERROR_USER_NOT_AUTHORIZED,
    errorCode: httpResponseConstants.HTTP_UNAUTHORIZED_ERROR,
  }, {
    errorMsg: voteService.ERROR_CALL_NOT_FOUND,
    errorCode: httpResponseConstants.HTTP_NOT_FOUND,
  }, {
    errorMsg: voteService.ERROR_WRONG_DATE_UPLOAD,
    errorCode: httpResponseConstants.HTTP_CONFLICT,
  }, {
    errorMsg: voteService.ERROR_VOTING_CLOSED,
    errorCode: httpResponseConstants.HTTP_CONFLICT,
  },
  ];
}

function formatAndSend(buffer, res) {
  res.setHeader('Content-Type', MIME_TYPE_CSV);
  res.setHeader('Content-Disposition', 'attachment; filename="inPersonResultsTemplate.csv"');
  res.send(buffer);
}

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function createInPersonVotes(req, res) {
  try {
    const params = {
      csvFileBase64: req.body,
      callId: controllerHelper.getSwaggerQueryParam(req, 'callId', undefined),
    };

    log.info(`${MODULE_NAME}:${createInPersonVotes.name} (IN) -> params: <<params>>`);

    // Check authorization
    await authService.authorizeJWTSecurityHeader(req.headers.authorization);

    const result = await voteService.createInPersonVotes(params);

    // Return result
    log.info(`${MODULE_NAME}:${createInPersonVotes.name} (OUT) -> result: ${JSON.stringify(params)}`);
    res.status(httpResponseConstants.HTTP_RESOURCE_CREATED).json(result);
  } catch (error) {
    controllerHelper.errorHandler(MODULE_NAME, error, res, buildConditionErrors());
  }
}

async function getInPersonResultsCSVTemplate(req, res) {
  try {
    const params = {};

    log.info(`${MODULE_NAME}:${getInPersonResultsCSVTemplate.name} (IN) -> params: <<params>>`);

    // Check authorization
    await authService.authorizeJWTSecurityHeader(req.headers.authorization);

    const result = voteService.getInPersonResultsCSVTemplate(params);

    // Return result
    log.info(`${MODULE_NAME}:${getInPersonResultsCSVTemplate.name} (OUT) -> result: ${JSON.stringify(params)}`);

    formatAndSend(result, res);
  } catch (error) {
    controllerHelper.errorHandler(MODULE_NAME, error, res, buildConditionErrors());
  }
}

module.exports = {
  createInPersonVotes,
  getInPersonResultsCSVTemplate,
};
