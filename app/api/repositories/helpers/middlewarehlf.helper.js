// middlewarehlf.helper.js

const axios = require('axios');

const log = require('../../infrastructure/logger/applicationLogger.gateway');
const configRepository = require('../config/mem.config.repository');
const middlewarehlfUserRepository = require('../user/middlewarehlf.user.repository');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[MiddlewareHLF Helper]';

// //////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS
// //////////////////////////////////////////////////////////////////////////////

async function initRequestOptions(params) {
  log.debug(`${MODULE_NAME}:${initRequestOptions.name} (IN) --> restMethod: ${params.restMethod}, apiMethod: ${params.apiMethod}`);

  const hlfConf = configRepository.getHLFConfig();
  // Get the uri of HLF middleware
  const hlfUrl = hlfConf.url;
  const hlfApiPrefix = hlfConf.apiPrefix;
  const hlfChaincodePrefix = hlfConf.chaincodePrefix;

  const options = {
    method: params.restMethod,
    url: `${hlfUrl}${hlfApiPrefix}${hlfChaincodePrefix}/${params.apiMethod}`,
    headers: {
      authorization: `Bearer ${params.tokenAuth}`,
    },
  };

  if (params.bodyParams !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.data = params.bodyParams;
  }

  log.debug(`${MODULE_NAME}:${initRequestOptions.name} (OUT) -> filter: ${JSON.stringify(options)}`);
  return options;
}

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function invoke(restMethod, apiMethod, bodyParams) {
  try {
    log.debug(`${MODULE_NAME}:${invoke.name} (IN) --> restMethod: ${restMethod}, bodyParams: ${JSON.stringify(bodyParams)}`);

    // Get auth Credentials
    const authCredentials = configRepository.getHLFConfig().authentication;
    // Authenticate and get tokenAuth
    const tokenAuth = await middlewarehlfUserRepository.authenticateUser(authCredentials);

    // Building params
    const params = {
      restMethod,
      apiMethod,
      bodyParams,
      tokenAuth,
    };

    // Prepare options before call API method
    const options = await initRequestOptions(params);
    log.debug(`${MODULE_NAME}:${invoke.name} HLF will called with options: ${JSON.stringify(options)}`);

    const result = await axios(options);

    log.debug(`${MODULE_NAME}:${invoke.name} (OUT) -> result: <<transaction result>>`);
    return result.data;
  } catch (error) {
    log.error(`${MODULE_NAME}:${invoke.name} (ERROR) --> error: ${error.message}`);
    throw error;
  }
}

module.exports = {
  invoke,
};
