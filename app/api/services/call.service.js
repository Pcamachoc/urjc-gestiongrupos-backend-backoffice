// call.service.js

const log = require('../infrastructure/logger/applicationLogger.gateway');
const callRepository = require('../repositories/call/middlewarehlf.call.repository');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[Call Service]';

const {
  ERROR_CALL_NOT_FOUND, ERROR_CALL_BEGIN, ERROR_INITDATE_LATER, ERROR_INITDATE_ENDDATE,
} = callRepository;

const SUCCESS = 'SUCCESS';
const MESSAGE_OK_OBJECT = {
  message: 'OK',
};

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function createCall(params) {
  log.debug(`${MODULE_NAME}:${createCall.name} (IN) --> params: ${JSON.stringify(params)}`);

  let result = await callRepository.createCall(params);

  // Same response as params
  if (result !== undefined && result[0].status !== undefined && result[0].status === SUCCESS) {
    result = params.args;
  }
  log.debug(`${MODULE_NAME}:${createCall.name} (OUT) --> result: ${JSON.stringify(result)}`);
  return result;
}

async function getCalls(params) {
  log.debug(`${MODULE_NAME}:${getCalls.name} (IN) --> params: ${JSON.stringify(params)}`);

  const result = await callRepository.getCalls(params);

  log.debug(`${MODULE_NAME}:${getCalls.name} (OUT) --> result: <<result>>`);
  return result;
}

async function deleteCall(params) {
  log.debug(`${MODULE_NAME}:${deleteCall.name} (IN) --> params: ${JSON.stringify(params)}`);

  let result = await callRepository.deleteCall(params);

  log.debug(`${MODULE_NAME}:${deleteCall.name} (OUT) --> result: ${JSON.stringify(result)}`);

  if (result !== undefined && result[0].status !== undefined && result[0].status === SUCCESS) {
    result = MESSAGE_OK_OBJECT;
  }
  return result;
}

async function getCallById(params) {
  log.debug(`${MODULE_NAME}:${getCallById.name} (IN) --> params: ${JSON.stringify(params)}`);

  const result = await callRepository.getCallById(params);

  log.debug(`${MODULE_NAME}:${getCallById.name} (OUT) --> result: <<result>>`);
  return result;
}

async function updateCounterCall(params) {
  log.debug(`${MODULE_NAME}:${updateCounterCall.name} (IN) --> params: ${JSON.stringify(params)}`);

  const result = await callRepository.updateCounterCall(params);

  log.debug(`${MODULE_NAME}:${updateCounterCall.name} (OUT) --> result: <<result>>`);
  return result;
}

async function updateCall(params) {
  log.debug(`${MODULE_NAME}:${updateCall.name} (IN) --> params: ${JSON.stringify(params)}`);

  const result = await callRepository.updateCall(params);

  log.debug(`${MODULE_NAME}:${updateCall.name} (OUT) --> result: <<result>>`);
  return result;
}

async function getBlockchainReport(params) {
  log.debug(`${MODULE_NAME}:${getBlockchainReport.name} (IN) --> params: ${JSON.stringify(params)}`);

  const result = await callRepository.getBlockchainReport(params);

  log.debug(`${MODULE_NAME}:${getBlockchainReport.name} (OUT) --> result: <<result>>`);
  return result;
}

module.exports = {
  ERROR_CALL_NOT_FOUND,
  ERROR_CALL_BEGIN,
  ERROR_INITDATE_LATER,
  ERROR_INITDATE_ENDDATE,
  createCall,
  getCalls,
  deleteCall,
  getCallById,
  updateCounterCall,
  updateCall,
  getBlockchainReport,
};
