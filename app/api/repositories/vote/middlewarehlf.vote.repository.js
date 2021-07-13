// middlewarehlf.vote.repository.js
const _ = require('lodash');
const log = require('../../infrastructure/logger/applicationLogger.gateway');
const configRepository = require('../config/mem.config.repository');
const middlewareHlfHelper = require('../helpers/middlewarehlf.helper');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[MiddlewareHLF Vote Repository]';

const PUT_METHOD = 'PUT';
const INNER_ERROR_CALL_NOT_FOUND = 'call not found';
const ERROR_CALL_NOT_FOUND = INNER_ERROR_CALL_NOT_FOUND;
const INNER_ERROR_WRONG_DATE_UPLOAD = 'votes must be uploaded after the in-person voting board date';
const ERROR_WRONG_DATE_UPLOAD = INNER_ERROR_WRONG_DATE_UPLOAD;
const INNER_ERROR_VOTING_CLOSED = 'voting closed';
const ERROR_VOTING_CLOSED = INNER_ERROR_VOTING_CLOSED;

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function createInPersonVotes(params) {
  log.debug(`${MODULE_NAME}:${createInPersonVotes.name} (IN) --> params: ${JSON.stringify(params)}`);
  try {
    const hlfConfig = configRepository.getHLFConfig().vote;

    const paramsVote = {
      functionName: hlfConfig.createInPersonVotesMethod,
      args: {
        listVotes: params.listVotes,
      },
    };

    const result = await middlewareHlfHelper.invoke(PUT_METHOD, hlfConfig.chaincodeId, paramsVote);

    log.debug(`${MODULE_NAME}:${createInPersonVotes.name} (OUT) --> result: <<result>>`);
    return result;
  } catch (error) {
    const responseError = _.get(error, 'response.data.error.message');
    if (responseError !== undefined && responseError.includes(INNER_ERROR_CALL_NOT_FOUND)) {
      throw new Error(ERROR_CALL_NOT_FOUND);
    } else if (responseError !== undefined && responseError.includes(INNER_ERROR_WRONG_DATE_UPLOAD)) {
      throw new Error(ERROR_WRONG_DATE_UPLOAD);
    } else if (responseError !== undefined && responseError.includes(INNER_ERROR_VOTING_CLOSED)) {
      throw new Error(ERROR_VOTING_CLOSED);
    }
    throw error;
  }
}

module.exports = {
  ERROR_CALL_NOT_FOUND,
  ERROR_WRONG_DATE_UPLOAD,
  ERROR_VOTING_CLOSED,
  createInPersonVotes,
};
