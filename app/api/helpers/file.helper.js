// file.helper.js

const fs = require('fs');
const readFilePromise = require('fs-readfile-promise');
const mime = require('mime-types');

const log = require('../infrastructure/logger/applicationLogger.gateway');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[File Helper]';

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

function buildRichFile(buffer, name) {
  log.debug(`${MODULE_NAME}:${buildRichFile.name} (IN) --> buffer: <<buffer>>, name: ${name}`);
  const richFileResult = {
    buffer,
    name,
    mimetype: mime.lookup(name),
  };

  log.debug(`${MODULE_NAME}:${buildRichFile.name} (OUT) --> richFile created OK with size: ${buffer.size}`);
  return richFileResult;
}

function traceRichFile(richFile) {
  if (richFile === null || richFile === undefined) {
    return ('<<file undefined>>');
  }

  let size = 'empty';
  if (richFile.buffer != null) {
    size = richFile.buffer.length;
  }
  return (`buffer: <<buffer>>, name: ${richFile.name}, mimetype: ${richFile.mimetype}, size: ${size}`);
}

async function loadFile(pathfile) {
  log.debug(`${MODULE_NAME}:${loadFile.name} (IN) --> pathfile: ${pathfile}`);
  const buffer = await readFilePromise(pathfile);

  log.debug(`${MODULE_NAME}:${loadFile.name} (OUT) --> buffer: <<buffer>>`);
  return buffer;
}

function deleteFile(pathfile) {
  log.debug(`${MODULE_NAME}:${deleteFile.name} (IN) --> path: ${pathfile}`);
  return new Promise((resolve, reject) => {
    fs.unlink(pathfile, (err) => {
      if (err && err.code === 'ENOENT') {
        // file doesn't exist
        log.debug(`${MODULE_NAME}:${deleteFile.name} (OUT) --> File doesn't exist, won't remove it.`);
        resolve(false);
      } else if (err) {
        // other errors, e.g. maybe we don't have enough permission
        log.error(`${MODULE_NAME}:${deleteFile.name} (OUT) --> Error occurred while trying to remove file`);
        reject(new Error('Error occurred while trying to remove file'));
      } else {
        log.debug(`${MODULE_NAME}:${deleteFile.name} (OUT) --> Removed`);
        resolve(true);
      }
    });
  });
}

module.exports = {
  buildRichFile,
  loadFile,
  deleteFile,
  traceRichFile,
};
