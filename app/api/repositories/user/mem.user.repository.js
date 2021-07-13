// user.repository.js

const log = require('../../infrastructure/logger/applicationLogger.gateway');
const memConfigRepository = require('../config/mem.config.repository');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[Mem User Repository]';

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

function getUserByFilterWithSecurityInfo(filter) {
  return new Promise((resolve, reject) => {
    try {
      log.debug(`${MODULE_NAME}:${getUserByFilterWithSecurityInfo.name} (IN) --> filter: ${JSON.stringify(filter)}`);

      let result;

      const users = memConfigRepository.getAuthUsers();

      if (filter !== undefined && filter.username !== undefined && filter.passwd !== undefined) {
        result = users.find(x => x.username === filter.username && x.passwd === filter.passwd);
      } else if (filter !== undefined && filter.username !== undefined) {
        result = users.find(x => x.username === filter.username);
      } else if (filter !== undefined && filter.passwd !== undefined) {
        result = users.find(x => x.passwd === filter.passwd);
      }

      log.debug(`${MODULE_NAME}:${getUserByFilterWithSecurityInfo.name} (OUT) --> result: ${JSON.stringify(result)}`);
      resolve(result);
    } catch (error) {
      log.error(`${MODULE_NAME}:${getUserByFilterWithSecurityInfo.name} (ERROR) --> error: ${error.stack}`);
      reject(error);
    }
  });
}

module.exports = {
  getUserByFilterWithSecurityInfo,
};
