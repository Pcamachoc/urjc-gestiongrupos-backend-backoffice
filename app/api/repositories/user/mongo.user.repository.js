// mongo.user.repository.js

/* eslint-disable no-await-in-loop */

const mongoose = require('mongoose');

const log = require('../../infrastructure/logger/applicationLogger.gateway');
const { User } = require('./mongo.user'); // User Schema

const mongoGroupRepository = require('../../repositories/group/mongo.group.repository');
const mongoRoleRepository = require('../../repositories/role/mongo.role.repository');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[Mongo User Repository]';

// //////////////////////////////////////////////////////////////////////////////
// PRIVATE FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function getCountUsers(filter) {
  log.debug(`${MODULE_NAME}:${getCountUsers.name} (IN) -> filter: ${JSON.stringify(filter)}`);

  // Get count
  const queryCount = User.count(filter);
  const count = await queryCount.exec();

  log.debug(`${MODULE_NAME}:${getCountUsers.name} (OUT) -> result: ${count}`);

  return count;
}

async function fillGroupRoleDetails(userFound) {
  // 1. Push the basic info
  const userInfo = {};
  userInfo.id = userFound.id;
  userInfo.name = userFound.name;
  userInfo.surname = userFound.surname;
  userInfo.username = userFound.username;
  userInfo.email = userFound.email;
  userInfo.enabled = userFound.enabled;
  userInfo.initDate = userFound.initDate;
  userInfo.password = userFound.password;
  userInfo.groups = userFound.groups;

  const groupsWithInfo = [];
  // 2. Load the info of roles associated to the user's groups - OLD SCHOOL WAY
  for (let j = 0; j < userFound.groups.length; j += 1) {
    const groupIdIndex = userFound.groups[j];
    // eslint-disable-next-line no-await-in-loop
    const groupFound = await mongoGroupRepository.getGroupById(groupIdIndex);
    if (groupFound != null) {
      groupsWithInfo.push(groupFound);
    }
  }

  userInfo.richGroups = groupsWithInfo;

  // 3. Load the info or functionalities associated to the user's roles - OLD SCHOOL WAY
  for (let m = 0; m < userInfo.richGroups.length; m += 1) {
    const groupIndex = userInfo.richGroups[m];
    for (let k = 0; k < groupIndex.roles.length; k += 1) {
      const roleIdIndex = groupIndex.roles[k];
      // eslint-disable-next-line no-await-in-loop
      const roleFound = await mongoRoleRepository.getRoleById(roleIdIndex);
      if (roleFound != null) {
        groupIndex.roles[k] = roleFound;
      }
    }
  }
  log.debug(`${MODULE_NAME}:${fillGroupRoleDetails.name} (OUT) -> userInfo: ${JSON.stringify(userInfo)}`);
  return userInfo;
}

// Fill all users info with complete groups/roles details
async function getCompleteDetailsForUsers(users) {
  const filledUsers = [];

  for (let i = 0; i < users.length; i += 1) {
    filledUsers.push(await fillGroupRoleDetails(users[i]));
  }
  return filledUsers;
}

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function createUser(newUser) {
  log.info(`${MODULE_NAME}:${createUser.name} (IN) -> newUser: ${JSON.stringify(newUser)}`);

  const result = await User.create(newUser);

  log.info(`${MODULE_NAME}:${createUser.name} (OUT) -> result: ${JSON.stringify(newUser)}`);
  return result;
}

async function updateUser(id, userToUpdate) {
  log.info(`${MODULE_NAME}:${updateUser.name} (IN) -> id: ${id}, userToUpdate: ${JSON.stringify(userToUpdate)}`);

  const result = await User.findOneAndUpdate(
    { id },
    { $set: userToUpdate },
    { new: true },
  );

  log.info(`${MODULE_NAME}:${updateUser.name} (OUT) -> result: ${JSON.stringify(result)}`);
  return result;
}

async function getUserById(id) {
  log.debug(`${MODULE_NAME}:${getUserById.name} (IN) -> id: ${id}`);

  const result = await User.findOne({ id });

  log.debug(`${MODULE_NAME}:${getUserById.name} (OUT) -> result: ${JSON.stringify(result)}`);
  return result;
}

async function getUserByFilter(filter) {
  log.debug(`${MODULE_NAME}:${getUserByFilter.name} (IN) -> filter: ${JSON.stringify(filter)}`);

  const result = await User.findOne(filter);

  log.debug(`${MODULE_NAME}:${getUserByFilter.name} (OUT) -> result: ${JSON.stringify(result)}`);
  return result;
}

// Get the complete security user information, containing the groups, roles and functionalities associated
// to the user
async function getUserByFilterWithSecurityInfo(filter) {
  log.debug(`${MODULE_NAME}:${getUserByFilterWithSecurityInfo.name} (IN) -> filter: ${filter}`);

  // Load the user
  const userFound = await getUserByFilter(filter);

  if (userFound == null) {
    return null;
  }

  log.debug(`${MODULE_NAME}:${getUserByFilterWithSecurityInfo.name} (MID) -> userFound: ${JSON.stringify(userFound)}`);

  const userInfo = await fillGroupRoleDetails(userFound);
  return userInfo;
}

async function getUsers(filter, params) {
  log.debug(`${MODULE_NAME}:${getUsers.name} (IN) -> params: ${JSON.stringify(filter, params)}`);

  // Get verbose for queries -- For testing
  mongoose.set('debug', true);

  // First, get number of Users
  const count = await getCountUsers(filter);
  log.debug(`${MODULE_NAME}:${getUsers.name} (MIDDLE) -> count: ${count}`);

  // Prepare initial query
  const query = User.find(filter);
  // Sorting
  if (params != null && params.sortBy != null) {
    query.sort(params.sortBy);
  }
  // Apply pagination
  if (params != null && params.limit != null && params.offset != null) {
    query.limit(params.limit).skip(params.offset);
  }
  // Executing query
  const arrayResult = await query.exec();
  // Building result
  const result = {
    elements: await getCompleteDetailsForUsers(arrayResult),
    totalElements: count,
  };
  // Settings the offset and limit applied
  if (params != null && params.limit != null && params.offset != null) {
    result.limit = params.limit;
    result.offset = params.offset;
  }

  log.debug(`${MODULE_NAME}:${getUsers.name} (OUT) -> result: <<result>>`);
  return result;
}

async function deleteUserById(id) {
  log.debug(`${MODULE_NAME}:${deleteUserById.name} (IN) -> id: ${id}`);

  const innerResult = await User.deleteOne({ id });
  log.debug(`${MODULE_NAME}:${deleteUserById.name} (MID) -> innerResult: ${JSON.stringify(innerResult)}`);

  let result = false;
  if (innerResult.ok === 1 && innerResult.deletedCount === 1) {
    result = true;
  }

  log.debug(`${MODULE_NAME}:${deleteUserById.name} (OUT) -> result: ${result}`);
  return result;
}

async function addGroup2User(userId, groupId) {
  log.info(`${MODULE_NAME}:${addGroup2User.name} (IN) -> userId: ${userId}, groupId: ${groupId}`);

  const result = await User.findOneAndUpdate(
    { id: userId },
    { $addToSet: { groups: groupId } },
    { safe: true, new: true },
  );

  log.info(`${MODULE_NAME}:${addGroup2User.name} (OUT) -> result: ${JSON.stringify(result)}`);
  return result;
}

async function checkUserExistsByFilter(filter, messageError) {
  const userFound = await getUserByFilterWithSecurityInfo(filter);
  if (userFound == null) {
    throw new Error(messageError);
  }
  return userFound;
}

async function checkUserNotExistsByFilter(filter, messageError) {
  const userFound = await getUserByFilterWithSecurityInfo(filter);
  if (userFound != null) {
    throw new Error(messageError);
  }
}

module.exports = {
  createUser,
  updateUser,
  getUserById,
  getUserByFilter,
  getUserByFilterWithSecurityInfo,
  getUsers,
  deleteUserById,
  addGroup2User,
  checkUserExistsByFilter,
  checkUserNotExistsByFilter,
};
