// call.controller.js
const { parse } = require('json2csv');

const log = require('../infrastructure/logger/applicationLogger.gateway');
const httpResponseConstants = require('../constants/httpResponse.contants');
const controllerHelper = require('../helpers/controller.helper');
const callService = require('../services/call.service');
const authService = require('../services/auth.service');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[Call Controller]';
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
    errorMsg: callService.ERROR_CALL_NOT_FOUND,
    errorCode: httpResponseConstants.HTTP_CONFLICT,
  }, {
    errorMsg: callService.ERROR_CALL_BEGIN,
    errorCode: httpResponseConstants.HTTP_CONFLICT,
  }, {
    errorMsg: callService.ERROR_INITDATE_LATER,
    errorCode: httpResponseConstants.HTTP_CONFLICT,
  }, {
    errorMsg: callService.ERROR_INITDATE_ENDDATE,
    errorCode: httpResponseConstants.HTTP_CONFLICT,
  },
  ];
}

function formatAndSend(innerResult, res) {
  const csv = parse(innerResult);
  const buff = Buffer.from(csv);
  res.setHeader('Content-Type', MIME_TYPE_CSV);
  res.setHeader('Content-Disposition', `attachment; filename="blockchainReport-${Date.now()}.csv"`);
  res.send(buff);
}

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function createCall(req, res) {
  try {
    const params = {
      args: req.body,
    };

    log.info(`${MODULE_NAME}:${createCall.name} (IN) -> params: <<params>>`);

    // Check authorization
    await authService.authorizeJWTSecurityHeader(req.headers.authorization);

    const result = await callService.createCall(params);

    // Return result
    log.info(`${MODULE_NAME}:${createCall.name} (OUT) -> result: ${JSON.stringify(params)}`);
    res.status(httpResponseConstants.HTTP_RESOURCE_CREATED).json(result);
  } catch (error) {
    controllerHelper.errorHandler(MODULE_NAME, error, res, buildConditionErrors());
  }
}

async function getCalls(req, res) {
  try {
    const params = {
      fields: controllerHelper.getSwaggerQueryParam(req, 'fields', 'all'),
    };

    log.info(`${MODULE_NAME}:${getCalls.name} (IN) -> params: ${JSON.stringify(params)}`);

    // Check authorization
    await authService.authorizeJWTSecurityHeader(req.headers.authorization);

    const result = await callService.getCalls(params);

    // Return result
    log.info(`${MODULE_NAME}:${getCalls.name} (OUT) -> result: <<list of calls>>`);
    res.json(result);
  } catch (error) {
    controllerHelper.errorHandler(MODULE_NAME, error, res, buildConditionErrors());
  }
}

async function deleteCallById(req, res) {
  try {
    const params = {
      callId: controllerHelper.getSwaggerQueryParam(req, 'callId', null),
    };

    log.info(`${MODULE_NAME}:${deleteCallById.name} (IN) -> params: ${JSON.stringify(params)}`);

    // Check authorization
    await authService.authorizeJWTSecurityHeader(req.headers.authorization);

    const result = await callService.deleteCall(params);

    // Return result
    log.info(`${MODULE_NAME}:${deleteCallById.name} (OUT) -> result: ${JSON.stringify(params)}`);
    res.json(result);
  } catch (error) {
    controllerHelper.errorHandler(MODULE_NAME, error, res, buildConditionErrors());
  }
}

async function getCallById(req, res) {
  try {
    const params = {
      callId: controllerHelper.getSwaggerQueryParam(req, 'callId', null),
    };

    log.info(`${MODULE_NAME}:${getCallById.name} (IN) -> params: ${JSON.stringify(params)}`);

    // Check authorization
    await authService.authorizeJWTSecurityHeader(req.headers.authorization);

    const result = await callService.getCallById(params);

    // Return result
    log.info(`${MODULE_NAME}:${getCallById.name} (OUT) -> result: <<list of calls>>`);
    res.json(result);
  } catch (error) {
    controllerHelper.errorHandler(MODULE_NAME, error, res, buildConditionErrors());
  }
}

async function updateCounterCall(req, res) {
  try {
    const params = {
      callId: controllerHelper.getSwaggerQueryParam(req, 'callId', null),
    };

    log.info(`${MODULE_NAME}:${updateCounterCall.name} (IN) -> params: ${JSON.stringify(params)}`);

    // Check authorization
    await authService.authorizeJWTSecurityHeader(req.headers.authorization);
    // Retrieve idParticipant from token
    const loggedUser = authService.getUserInfoFromAuthHeader(req.headers.authorization);
    params.idParticipant = loggedUser.id;

    const result = await callService.updateCounterCall(params);

    // Return result
    log.info(`${MODULE_NAME}:${updateCounterCall.name} (OUT) -> result: <<list of calls>>`);
    res.json(result);
  } catch (error) {
    controllerHelper.errorHandler(MODULE_NAME, error, res, buildConditionErrors());
  }
}

async function updateCall(req, res) {
  try {
    const params = {
      callId: controllerHelper.getSwaggerQueryParam(req, 'callId', null),
      args: req.body,
    };

    log.info(`${MODULE_NAME}:${updateCall.name} (IN) -> params: ${JSON.stringify(params)}`);

    // Check authorization
    await authService.authorizeJWTSecurityHeader(req.headers.authorization);
    // Retrieve idParticipant from token
    const loggedUser = authService.getUserInfoFromAuthHeader(req.headers.authorization);
    params.idParticipant = loggedUser.id;

    const result = await callService.updateCall(params);

    // Return result
    log.info(`${MODULE_NAME}:${updateCall.name} (OUT) -> result: <<list of calls>>`);
    res.json(result);
  } catch (error) {
    controllerHelper.errorHandler(MODULE_NAME, error, res, buildConditionErrors());
  }
}

async function getBlockchainReport(req, res) {
  try {
    const params = {
      callId: controllerHelper.getSwaggerQueryParam(req, 'callId', null),
    };

    log.info(`${MODULE_NAME}:${getBlockchainReport.name} (IN) -> params: ${JSON.stringify(params)}`);

    // Check authorization
    await authService.authorizeJWTSecurityHeader(req.headers.authorization);
    // Retrieve idParticipant from token
    const loggedUser = authService.getUserInfoFromAuthHeader(req.headers.authorization);
    params.idParticipant = loggedUser.id;

    const result = await callService.getBlockchainReport(params);

    const csvResult = await formatAndSend(result, res);

    // Return result
    log.info(`${MODULE_NAME}:${getBlockchainReport.name} (OUT) -> result: <<list of calls>>`);
    res.send(csvResult);
  } catch (error) {
    controllerHelper.errorHandler(MODULE_NAME, error, res, buildConditionErrors());
  }
}

module.exports = {
  createCall,
  getCalls,
  deleteCallById,
  getCallById,
  updateCounterCall,
  updateCall,
  getBlockchainReport,
};
