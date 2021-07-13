// filesystem.config.repository.js

const path = require('path');
const readYaml = require('read-yaml-promise');

const log = require('../../infrastructure/logger/applicationLogger.gateway');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[FileSystem Config Repo]';
const PATH_CONFIG_FILES = './config';

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function get(filename) {
  log.debug(`${MODULE_NAME}:${get.name} (IN) -> filename: ${filename}`);

  const pathFile = PATH_CONFIG_FILES + path.sep + filename;

  const data = await readYaml(pathFile);
  log.debug(`${MODULE_NAME}:${get.name} (OUT) -> data: ${JSON.stringify(data)}`);
  return data;
}

module.exports = {
  PATH_CONFIG_FILES,
  get,
};
