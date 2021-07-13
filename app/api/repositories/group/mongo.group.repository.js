// mongo.group.repository.js

const log = require('../../infrastructure/logger/applicationLogger.gateway');
const { Group } = require('./mongo.group'); // Group Schema

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[Mongo Group Repository]';

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function createGroup(newGroup) {
  log.info(`${MODULE_NAME}:${createGroup.name} (IN) -> newGroup: ${JSON.stringify(newGroup)}`);

  const result = await Group.create(newGroup);

  log.info(`${MODULE_NAME}:${createGroup.name} (OUT) -> result: ${JSON.stringify(newGroup)}`);
  return result;
}

async function updateGroup(id, groupToUpdate) {
  log.info(`${MODULE_NAME}:${updateGroup.name} (IN) -> id: ${id}, groupToUpdate: ${JSON.stringify(groupToUpdate)}`);

  const result = await Group.findOneAndUpdate(
    { id },
    { $set: groupToUpdate },
    { new: true },
  );

  log.info(`${MODULE_NAME}:${updateGroup.name} (OUT) -> result: ${JSON.stringify(result)}`);
  return result;
}

async function getGroupById(id) {
  log.debug(`${MODULE_NAME}:${getGroupById.name} (IN) -> id: ${id}`);

  const result = await Group.findOne({ id });

  log.debug(`${MODULE_NAME}:${getGroupById.name} (OUT) -> result: ${JSON.stringify(result)}`);
  return result;
}

async function getGroupByName(name) {
  log.debug(`${MODULE_NAME}:${getGroupByName.name} (IN) -> name: ${name}`);

  const result = await Group.findOne({ name });

  log.debug(`${MODULE_NAME}:${getGroupByName.name} (OUT) -> result: ${JSON.stringify(result)}`);
  return result;
}

async function getGroupByFilter(filter) {
  log.debug(`${MODULE_NAME}:${getGroupByFilter.name} (IN) -> filter: ${JSON.stringify(filter)}`);

  const result = await Group.findOne(filter);

  log.debug(`${MODULE_NAME}:${getGroupByFilter.name} (OUT) -> result: ${JSON.stringify(result)}`);
  return result;
}

async function getAllGroups() {
  log.debug(`${MODULE_NAME}:${getAllGroups.name} (IN) -> no params`);

  const result = await Group.find({ });

  log.debug(`${MODULE_NAME}:${getAllGroups.name} (OUT) -> result: ${JSON.stringify(result)}`);
  return result;
}

async function deleteGroupById(groupId) {
  log.debug(`${MODULE_NAME}:${deleteGroupById.name} (IN) -> groupId: ${groupId}`);

  const innerResult = await Group.deleteOne({ id: groupId });
  log.debug(`${MODULE_NAME}:${deleteGroupById.name} (MID) -> innerResult: ${JSON.stringify(innerResult)}`);

  let result = false;
  if (innerResult.ok === 1 && innerResult.deletedCount === 1) {
    result = true;
  }

  log.debug(`${MODULE_NAME}:${deleteGroupById.name} (OUT) -> result: ${result}`);
  return result;
}

async function checkGroupExistsByFilter(filter, messageError) {
  const roleFound = await getGroupByFilter(filter);
  if (roleFound == null) {
    throw new Error(messageError);
  }
  return roleFound;
}

async function checkGroupNotExistsByFilter(filter, messageError) {
  const roleFound = await getGroupByFilter(filter);
  if (roleFound != null) {
    throw new Error(messageError);
  }
  return roleFound;
}

module.exports = {
  createGroup,
  updateGroup,
  getGroupById,
  getGroupByName,
  getGroupByFilter,
  getAllGroups,
  deleteGroupById,
  checkGroupExistsByFilter,
  checkGroupNotExistsByFilter,
};
