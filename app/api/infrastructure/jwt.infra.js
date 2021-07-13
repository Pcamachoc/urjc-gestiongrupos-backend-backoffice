// jwt.infra.js

const jwt = require('jwt-simple');
const moment = require('moment');

const log = require('../infrastructure/logger/applicationLogger.gateway');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[JWT Infra]';

const TOKEN_NOT_RECEIVED = 'Authorization token not received';
const TOKEN_NOT_VALID_OR_EXPIRED = 'Token not valid or expired';
const INTERNAL_ERROR = 'Internal Error validating token';

let tokenSecret;
let tokenExpiration;

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

function init(options) {
  tokenSecret = options.tokenSecret; // eslint-disable-line prefer-destructuring
  tokenExpiration = options.tokenExpiration; // eslint-disable-line prefer-destructuring
}

// Revolves the token.
// Returns true if token is resolved correctly of false in another case
function resolveToken(token) {
  try {
    // NOTE: If token is expired, launch exception and go to catch block
    jwt.decode(token, tokenSecret);

    return true;
  } catch (err) {
    log.error(`${MODULE_NAME}:${resolveToken.name} (ERROR) --> error: ${err.message}`);
    return false;
  }
}

function generateToken(userInfo) {
  log.debug(`${MODULE_NAME}:${generateToken.name} (IN) --> userInfo: ${JSON.stringify(userInfo)}, 
  tokenExpiration: ${tokenExpiration}, tokenSecret: ${tokenSecret}`);

  const payload = {
    sub: userInfo,
    iat: moment().unix(),
    exp: moment().add(tokenExpiration, 'minutes').unix(),
  };
  // NOTE: By default encoding uses HS256 to encoding
  const tokenResult = jwt.encode(payload, tokenSecret);

  log.debug(`${MODULE_NAME}:${generateToken.name} (OUT) --> tokenResult: <<tokenResult>>`);
  return tokenResult;
}

// Refreshes the token by an amount of time equals as token_expiration
function refreshToken(token) {
  log.debug(`${MODULE_NAME}:${refreshToken.name} (IN) --> token: <<obfuscated>>`);

  const payload = jwt.decode(token, tokenSecret);
  payload.iat = moment().unix();
  payload.exp = moment().add(tokenExpiration, 'minutes').unix();

  const tokenResult = jwt.encode(payload, tokenSecret);

  log.debug(`${MODULE_NAME}:${refreshToken.name} (OUT) --> Token refreshed OK`);
  return tokenResult;
}

function getUserInfoFromAuthHeader(authHeader) {
  log.debug(`${MODULE_NAME} ${getUserInfoFromAuthHeader.name} (IN) --> authHeader: ${authHeader}`);

  const token = authHeader.split(' ')[1];
  const payload = jwt.decode(token, tokenSecret);
  const userInfo = payload.sub;
  log.debug(`${MODULE_NAME} ${getUserInfoFromAuthHeader.name} (OUT) --> userInfo: ${JSON.stringify(userInfo)}`);
  return userInfo;
}

module.exports = {
  TOKEN_NOT_RECEIVED,
  TOKEN_NOT_VALID_OR_EXPIRED,
  INTERNAL_ERROR,
  init,
  generateToken,
  resolveToken,
  refreshToken,
  getUserInfoFromAuthHeader,
};
