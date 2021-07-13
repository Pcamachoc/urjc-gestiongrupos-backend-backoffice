// controller.helper.js

const _ = require('lodash');
const toStream = require('buffer-to-stream');

const log = require('../infrastructure/logger/applicationLogger.gateway');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[Controller Helper]'; // eslint-disable-line no-unused-vars

const DEFAULT_BUFFER_SIZE = 5000000; // in bytes

const ERROR_INTERNAL_SERVER_ERROR = 'Internal Server Error';
const ERROR_DESCRIPTION_DEFAULT = 'Internal Application Error';
const HTTP_DEFAULT_ERROR_CODE = 500;
const ERROR_FILE_NOT_UPLOADED = 'Required file not found when uploading';
const ERROR_FILE_BAD_FORMAT = 'Bad format of file. Only files allowed with extension';
const ERROR_FILE_NOT_FOUND_IN_UPLOAD = 'No file uploaded';

// //////////////////////////////////////////////////////////////////////////////
// PRIVATE FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

function fixControllerName(name) {
  let resultName = name;
  if (!(name.startsWith('[') || name.endsWith(']'))) {
    resultName = `[${name}]`;
  }
  return resultName;
}

function buildErrorCondDefault(controllerName, callerName) {
  return {
    error: {
      code: HTTP_DEFAULT_ERROR_CODE,
      message: ERROR_INTERNAL_SERVER_ERROR,
      description: `${ERROR_INTERNAL_SERVER_ERROR} in ${controllerName}:${callerName}`,
    },
  };
}

function buildErrorCondCustom(errorCond, error, controllerName, callerName) {
  return {
    error: {
      code: errorCond.errorCode,
      message: error.message,
      description: `${error.message} in ${controllerName}:${callerName}`,
    },
  };
}

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

function errorHandler(controllerName, error, res, svcCondErrors) {
  // log.debug(`${MODULE_NAME}:${errorHandler.caller.name} (IN) -->
  // controllerName: ${controllerName}, error.message: ${error.message},
  // res: <<object>>, svcCondErrors: ${JSON.stringify(svcCondErrors)}`);

  // Find if errorCond is contained in svcCondErrors
  let errorCondFound;
  if (svcCondErrors !== undefined && svcCondErrors.length > 0) {
    errorCondFound = svcCondErrors.find(elto => error.message.startsWith(elto.errorMsg));
  }

  let jsonResult;
  let errorCodeResult;

  log.error(`${fixControllerName(controllerName)}:${errorHandler.caller.name} (ERROR) --> ${error.stack}`);

  // In case of not found, use the default error (500 error)
  if (errorCondFound === undefined) {
    log.debug(`${MODULE_NAME}:${errorHandler.caller.name} (MID) --> Building a Generic Error`);
    jsonResult = buildErrorCondDefault(controllerName, errorHandler.caller.name);
    errorCodeResult = jsonResult.error.code;
  } else {
    log.debug(`${MODULE_NAME}:${errorHandler.caller.name} (MID) --> Building a Custom Error`);
    jsonResult = buildErrorCondCustom(errorCondFound, error, controllerName, errorHandler.caller.name);
    errorCodeResult = jsonResult.error.code;
  }

  // Returning response
  log.debug(`${fixControllerName(controllerName)}:${errorHandler.caller.name} (OUT) --> errorCodeResult: ${errorCodeResult}, jsonResult: ${JSON.stringify(jsonResult)}`);
  res.status(errorCodeResult).send(jsonResult);
}

function getSwaggerQueryParam(req, name, defaultValue) {
  let defaultApplied = null;
  if (defaultValue !== undefined) {
    defaultApplied = defaultValue;
  }

  const result = _.get(req, `swagger.params.${name}.value`, defaultApplied);
  return result;
}

// Send to response the file structure
function fileToResponse(res, richFile) {
  res.setHeader('content-disposition', `attachment; filename=${richFile.name}`);
  if (richFile.mimetype !== undefined) {
    res.writeHead(200, { 'content-type': richFile.mimetype });
  }
  const readable = toStream(richFile.buffer, DEFAULT_BUFFER_SIZE);

  readable.on('data', (chunk) => {
    if (!res.write(chunk)) {
      readable.pause();
    }
  });

  readable.on('end', () => {
    res.end();
  });

  res.on('drain', () => {
    readable.resume();
  });
}

module.exports = {
  HTTP_DEFAULT_ERROR_CODE,
  ERROR_INTERNAL_SERVER_ERROR,
  ERROR_DESCRIPTION_DEFAULT,
  ERROR_FILE_NOT_UPLOADED,
  ERROR_FILE_BAD_FORMAT,
  ERROR_FILE_NOT_FOUND_IN_UPLOAD,
  errorHandler,
  getSwaggerQueryParam,
  fileToResponse,
};
