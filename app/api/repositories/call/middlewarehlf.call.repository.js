// middlewarehlf.call.repository.js

const _ = require('lodash');
const log = require('../../infrastructure/logger/applicationLogger.gateway');
const configRepository = require('../config/mem.config.repository');
const middlewareHlfHelper = require('../helpers/middlewarehlf.helper');
const mongoRepository = require('../user/mongo.user.repository');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[MiddlewareHLF Call Repository]';

const GET_METHOD = 'GET';
const PUT_METHOD = 'PUT';

const INNER_ERROR_DATA_NOT_FOUND = 'Data not found';
const INNER_ERROR_CALL_NOT_FOUND = 'Call not found';
const INNER_ERROR_CALL_BEGIN = 'The call has already begun';
const INNER_ERROR_INITDATE_LATER = 'Current date is later than initDate';
const INNER_ERROR_INITDATE_ENDDATE = 'InitDate must be later than endDate';
const ERROR_CALL_NOT_FOUND = INNER_ERROR_CALL_NOT_FOUND;
const ERROR_CALL_BEGIN = INNER_ERROR_CALL_BEGIN;
const ERROR_INITDATE_LATER = INNER_ERROR_INITDATE_LATER;
const ERROR_INITDATE_ENDDATE = INNER_ERROR_INITDATE_ENDDATE;

// //////////////////////////////////////////////////////////////////////////////
// PRIVATE FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function getUsersInfoById(participants) {
  log.debug(`${MODULE_NAME}:${getUsersInfoById.name} (IN) --> params: ${JSON.stringify(participants)}`);
  for (let i = 0; i < participants.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const participant = await mongoRepository.getUserById(participants[i].id);
    // eslint-disable-next-line no-param-reassign
    participants[i].name = participant.name;
  }
  log.debug(`${MODULE_NAME}:${getUsersInfoById.name} (OUT) --> params: ${JSON.stringify(participants)}`);
}

async function buildObject(params) {
  log.debug(`${MODULE_NAME}:${buildObject.name} (IN) --> params: ${JSON.stringify(params)}`);

  const arrayResult = [];
  let objectResult = {};

  if ((params) && params.length > 0) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < params.length; i++) {
      const objectResultAux = {};
      // eslint-disable-next-line prefer-destructuring
      objectResult = params[i][0];
      objectResultAux.tx_id = objectResult.tx_id;
      objectResultAux.date = objectResult.date;
      // eslint-disable-next-line no-loop-func
      Object.keys(objectResult.value).forEach((key) => {
        if (key === 'id' || key === 'idParticipant') {
          objectResultAux[key] = objectResult.value[key];
        } else if (key === 'proposalsVote') {
          // eslint-disable-next-line no-plusplus
          for (let j = 0; j < objectResult.value[key].length; j++) {
            objectResultAux[objectResult.value[key][j].description] = objectResult.value[key][j].option;
          }
        }
      });
      // eslint-disable-next-line no-await-in-loop
      const infoUser = await mongoRepository.getUserById(objectResultAux.idParticipant);
      objectResultAux.name = infoUser.name;
      objectResultAux.surname = infoUser.surname;
      arrayResult.push(objectResultAux);
    }
  }

  return arrayResult;
}
// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function createCall(params) {
  log.debug(`${MODULE_NAME}:${createCall.name} (IN) --> params: ${JSON.stringify(params)}`);

  const hlfConfig = configRepository.getHLFConfig().call;
  await getUsersInfoById(params.args.participants);

  const paramsCall = {
    functionName: hlfConfig.createCallMethod,
    args: params.args,
  };

  const result = await middlewareHlfHelper.invoke(PUT_METHOD, hlfConfig.chaincodeId, paramsCall);

  log.debug(`${MODULE_NAME}:${createCall.name} (OUT) --> result: <<result>>`);
  return result;
}

async function getCalls(params) {
  log.debug(`${MODULE_NAME}:${getCalls.name} (IN) --> params: ${JSON.stringify(params)}`);

  const hlfConfig = configRepository.getHLFConfig().call;
  const invokeParams = {
    functionName: hlfConfig.findCallsMethod,
    args: {},
  };

  log.debug(`${MODULE_NAME}:${getCalls.name} (MID) --> invokeParams: ${JSON.stringify(invokeParams)}`);

  const result = await middlewareHlfHelper.invoke(GET_METHOD, hlfConfig.chaincodeId, invokeParams);

  log.debug(`${MODULE_NAME}:${getCalls.name} (MID) --> result: <<result>>`);
  return result;
}

async function deleteCall(params) {
  try {
    log.debug(`${MODULE_NAME}:${deleteCall.name} (IN) --> params: ${JSON.stringify(params)}`);

    const hlfConfig = configRepository.getHLFConfig().call;
    const paramsCall = {
      functionName: hlfConfig.deleteCallMethod,
      args: {
        id: params.callId,
      },
    };

    const result = await middlewareHlfHelper.invoke(PUT_METHOD, hlfConfig.chaincodeId, paramsCall);

    log.debug(`${MODULE_NAME}:${deleteCall.name} (OUT) --> result: <<result>>`);
    return result;
  } catch (error) {
    const responseError = _.get(error, 'response.data.error.message');
    if (responseError !== undefined && responseError.includes(INNER_ERROR_CALL_NOT_FOUND)) {
      throw new Error(ERROR_CALL_NOT_FOUND);
    }
    throw error;
  }
}

async function getCallById(params) {
  log.debug(`${MODULE_NAME}:${getCallById.name} (IN) --> params: ${JSON.stringify(params)}`);

  try {
    const hlfConfig = configRepository.getHLFConfig().call;
    const invokeParams = {
      functionName: hlfConfig.findCallByIdMethod,
      args: {
        id: params.callId,
      },
    };

    log.debug(`${MODULE_NAME}:${getCallById.name} (MID) --> invokeParams: ${JSON.stringify(invokeParams)}`);

    const result = await middlewareHlfHelper.invoke(GET_METHOD, hlfConfig.chaincodeId, invokeParams);

    log.debug(`${MODULE_NAME}:${getCallById.name} (MID) --> result: <<result>>`);
    return result;
  } catch (error) {
    const responseError = _.get(error, 'response.data.error.message');
    if (responseError !== undefined && responseError.includes(INNER_ERROR_DATA_NOT_FOUND)) {
      throw new Error(ERROR_CALL_NOT_FOUND);
    }
    throw error;
  }
}

async function updateCounterCall(params) {
  log.debug(`${MODULE_NAME}:${updateCounterCall.name} (IN) --> params: ${JSON.stringify(params)}`);

  try {
    const hlfConfig = configRepository.getHLFConfig().call;
    const invokeParams = {
      functionName: hlfConfig.updateCounterCallMethod,
      args: {
        id: params.callId,
      },
    };

    log.debug(`${MODULE_NAME}:${updateCounterCall.name} (MID) --> invokeParams: ${JSON.stringify(invokeParams)}`);

    await middlewareHlfHelper.invoke(PUT_METHOD, hlfConfig.chaincodeId, invokeParams);

    log.debug(`${MODULE_NAME}:${updateCounterCall.name} (MID) --> result: <<result>>`);

    const result = await getCallById(params);

    return result;
  } catch (error) {
    const responseError = _.get(error, 'response.data.error.message');
    if (responseError !== undefined && responseError.includes(INNER_ERROR_DATA_NOT_FOUND)) {
      throw new Error(ERROR_CALL_NOT_FOUND);
    }
    throw error;
  }
}

async function updateCall(params) {
  log.debug(`${MODULE_NAME}:${updateCall.name} (IN) --> params: ${JSON.stringify(params)}`);

  try {
    const hlfConfig = configRepository.getHLFConfig().call;
    await getUsersInfoById(params.args.participants);
    const invokeParams = {
      functionName: hlfConfig.updateCallMethod,
      args: {
        id: params.callId,
        body: params.args,
      },
    };

    log.debug(`${MODULE_NAME}:${updateCall.name} (MID) --> invokeParams: ${JSON.stringify(invokeParams)}`);

    await middlewareHlfHelper.invoke(PUT_METHOD, hlfConfig.chaincodeId, invokeParams);

    log.debug(`${MODULE_NAME}:${updateCall.name} (MID) --> result: <<result>>`);

    const result = await getCallById(params);

    return result;
  } catch (error) {
    const responseError = _.get(error, 'response.data.error.message');
    if (responseError !== undefined && responseError.includes(INNER_ERROR_DATA_NOT_FOUND)) {
      throw new Error(ERROR_CALL_NOT_FOUND);
    } else if (responseError !== undefined && responseError.includes(INNER_ERROR_CALL_BEGIN)) {
      throw new Error(ERROR_CALL_BEGIN);
    } else if (responseError !== undefined && responseError.includes(INNER_ERROR_INITDATE_LATER)) {
      throw new Error(ERROR_INITDATE_LATER);
    } else if (responseError !== undefined && responseError.includes(INNER_ERROR_INITDATE_ENDDATE)) {
      throw new Error(ERROR_INITDATE_ENDDATE);
    }
    throw error;
  }
}

async function getBlockchainReport(params) {
  log.debug(`${MODULE_NAME}:${getBlockchainReport.name} (IN) --> params: ${JSON.stringify(params)}`);

  try {
    const hlfConfig = configRepository.getHLFConfig().call;
    const invokeParams = {
      functionName: hlfConfig.getBlockchainReportMethod,
      args: {
        id: params.callId,
      },
    };

    log.debug(`${MODULE_NAME}:${getBlockchainReport.name} (MID) --> invokeParams: ${JSON.stringify(invokeParams)}`);

    const result = await middlewareHlfHelper.invoke(GET_METHOD, hlfConfig.chaincodeId, invokeParams);

    log.debug(`${MODULE_NAME}:${getBlockchainReport.name} (MID) --> result: <<result>>`);

    const arrayResult = await buildObject(result);

    return arrayResult;
  } catch (error) {
    const responseError = _.get(error, 'response.data.error.message');
    if (responseError !== undefined && responseError.includes(INNER_ERROR_DATA_NOT_FOUND)) {
      throw new Error(ERROR_CALL_NOT_FOUND);
    }
    throw error;
  }
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
