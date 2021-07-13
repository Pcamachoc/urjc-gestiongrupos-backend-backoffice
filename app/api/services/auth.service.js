// auth.service.js

/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */

const callerId = require('caller-id');

const log = require('../infrastructure/logger/applicationLogger.gateway');
const jwtInfra = require('../infrastructure/jwt.infra');
const genericDB = require('../repositories/user/helper/genericDB.user.helper');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[Auth Service]';

const REPOSITORIES_PREFIX = '../repositories/user/';
const USER_REPOSITORY_SUFFIX = '.user.repository';

const AUTH_TYPE_USERS_IN_MONGO = 'usersInMongo';
const AUTH_TYPE_USERS_IN_CONFIG = 'usersInConfig';
const AUTH_TYPE_USERS_IN_CLOUD = 'usersInCloud';

const ERROR_TYPE_OF_AUTHENTICATION_NOT_DEFINED = 'Authentication Type not defined';
const ERROR_SECURITY_HEADER_NOT_RECEIVED = 'Security header not received';
const ERROR_TOKEN_NOT_VALID_OR_EXPIRED = 'Token not valid or expired';
const ERROR_USER_NOT_AUTHENTICATED = 'User not authenticated';
const ERROR_USER_NOT_AUTHORIZED = 'User not authorized';
const ERROR_USER_NOT_AUTHORIZED_FUNC_NOT_RECOGNIZED = 'User not authorized because the functionality is not recognized';

// //////////////////////////////////////////////////////////////////////////////
// PRIVATE FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

function selectAuthRepository(userRepositoryPrefix) {
  log.debug(`${MODULE_NAME}:${selectAuthRepository.name} (IN) -> userRepositoryPrefix: ${JSON.stringify(userRepositoryPrefix)}`);

  const authRepository = require(`${REPOSITORIES_PREFIX}${userRepositoryPrefix}${USER_REPOSITORY_SUFFIX}`);

  log.debug(`${MODULE_NAME}:${selectAuthRepository.name} (OUT) -> authRepository: <<authRepository>>`);

  return authRepository;
}

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function authenticateCredentials(authCredentials, authConfig) {
  log.debug(`${MODULE_NAME}:${authenticateCredentials.name} (IN) -> authCredentials: ${JSON.stringify(authCredentials)}, authConfig: ${JSON.stringify(authConfig)}`);

  // Select the Authentication Repository
  // eslint-disable-next-line no-shadow
  const authRepository = selectAuthRepository(authConfig.userRepository);

  // Authenticate the user using the authRepository obtained
  const authToken = await genericDB.authenticateUser(authCredentials, authRepository.getUserByFilterWithSecurityInfo, authConfig);

  // Builds a JSON object result
  const tokenResult = { token: authToken };
  // Returning Result
  log.debug(`${MODULE_NAME}:${authenticateCredentials.name} (OUT) -> tokenResult: <<tokenResult>>`);
  return tokenResult;
}

function authenticateJWTSecurityHeader(jwtSecurityHeader) {
  log.debug(`${MODULE_NAME}:${authenticateJWTSecurityHeader.name} (IN) -> jwtSecurityHeader: <<jwtSecurityHeader>>`);

  // Check if securityHeader is not empty
  if (jwtSecurityHeader == null) {
    log.error(`${MODULE_NAME}:${authenticateJWTSecurityHeader.name} (ERROR) -> Security header NOT received!`);
    throw new Error(ERROR_SECURITY_HEADER_NOT_RECEIVED);
  }

  // Split the Bearer
  const token = jwtSecurityHeader.split(' ')[1];
  // Revolve token
  const bResult = jwtInfra.resolveToken(token);

  // Check the result
  if (!bResult) {
    throw new Error(ERROR_TOKEN_NOT_VALID_OR_EXPIRED);
  }

  // Get the user and check if the user is ENABLED
  const userInfo = jwtInfra.getUserInfoFromAuthHeader(jwtSecurityHeader);

  if (!userInfo) {
    log.error(`${MODULE_NAME}:${authenticateJWTSecurityHeader.name} (ERROR) -> user not found`);
    throw new Error(ERROR_USER_NOT_AUTHENTICATED);
  }

  if (!userInfo.enabled) {
    log.error(`${MODULE_NAME}:${authenticateJWTSecurityHeader.name} (ERROR) -> username: ${userInfo.username} is DISABLED!`);
    throw new Error(ERROR_USER_NOT_AUTHENTICATED);
  }

  // Refresh the token (the return includes the Bearer prefix)
  const refreshedToken = jwtInfra.refreshToken(token);
  // Return result
  log.debug(`${MODULE_NAME}:${authenticateJWTSecurityHeader.name} (OUT) -> refreshedToken: <<refreshedToken>>`);
  return refreshedToken;
}

async function authorizeJWTSecurityHeader(jwtSecurityHeader) {
  log.debug(`${MODULE_NAME}:${authorizeJWTSecurityHeader.name} (IN) -> jwtSecurityHeader: ${jwtSecurityHeader}`);

  // Get the function caller name
  const { functionName } = callerId.getData();
  log.debug(`${MODULE_NAME}:${authorizeJWTSecurityHeader.name} (MID) -> functionName to authorize: ${functionName}`);

  // Get the user
  const userInfo = jwtInfra.getUserInfoFromAuthHeader(jwtSecurityHeader);
  // Check if user is ENABLED
  if (userInfo == null || !userInfo.enabled) {
    log.error(`${MODULE_NAME}:${authenticateJWTSecurityHeader.name} (ERROR) -> User is DISABLED`);
    throw new Error(ERROR_USER_NOT_AUTHORIZED);
  }

  // Finds the functionName in the roles associated to the user's groups -- FUNCTIONAL WAY
  const funcFoundInUser = userInfo.richGroups.some(group => group.roles.some(role => role.functionalities.find(element => element === functionName)));
  if (funcFoundInUser === false) {
    log.error(`${MODULE_NAME}:${authenticateJWTSecurityHeader.name} (ERROR) -> User NOT AUTHORIZED`);
    throw new Error(ERROR_USER_NOT_AUTHORIZED);
  }

  return funcFoundInUser;
}

function getUserInfoFromAuthHeader(jwtSecurityHeader) {
  return jwtInfra.getUserInfoFromAuthHeader(jwtSecurityHeader);
}

module.exports = {
  ERROR_SECURITY_HEADER_NOT_RECEIVED,
  ERROR_USER_NOT_AUTHENTICATED,
  ERROR_USER_NOT_AUTHORIZED,
  ERROR_USER_NOT_AUTHORIZED_FUNC_NOT_RECOGNIZED,
  ERROR_TOKEN_NOT_VALID_OR_EXPIRED,
  ERROR_TYPE_OF_AUTHENTICATION_NOT_DEFINED,
  AUTH_TYPE_USERS_IN_MONGO,
  AUTH_TYPE_USERS_IN_CONFIG,
  AUTH_TYPE_USERS_IN_CLOUD,
  authenticateCredentials,
  authenticateJWTSecurityHeader,
  authorizeJWTSecurityHeader,
  getUserInfoFromAuthHeader,
};
