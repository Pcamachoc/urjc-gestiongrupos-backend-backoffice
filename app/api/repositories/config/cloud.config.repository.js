// cloud.config.repository.js

const axios = require('axios');

const log = require('../../infrastructure/logger/applicationLogger.gateway');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[Cloud Config Repo]';

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function get(endpoint, file) {
  log.debug(`${MODULE_NAME}:${get.name} (IN) -> endpoint: ${endpoint}, file: ${file}`);

  const uri = `${endpoint}/${file}`;

  const response = await axios.get(uri);
  const { data } = response;

  log.debug(`${MODULE_NAME}:${get.name} (OUT) -> data: ${JSON.stringify(data)}`);
  return data;
}

module.exports = {
  get,
};
