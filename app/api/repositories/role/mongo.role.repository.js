// mongo.role.repository.js

const log = require('../../infrastructure/logger/applicationLogger.gateway');
const { Role } = require('./mongo.role'); // Role Schema

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[Mongo Role Repository]';

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function createRole(newRole) {
  log.info(`${MODULE_NAME}:${createRole.name} (IN) -> newRole: ${JSON.stringify(newRole)}`);

  const result = await Role.create(newRole);

  log.info(`${MODULE_NAME}:${createRole.name} (OUT) -> result: ${JSON.stringify(newRole)}`);
  return result;
}

async function updateRole(id, roleToUpdate) {
  log.info(`${MODULE_NAME}:${updateRole.name} (IN) -> id: ${id}, roleToUpdate: ${JSON.stringify(roleToUpdate)}`);

  const result = await Role.findOneAndUpdate(
    { id },
    { $set: roleToUpdate },
    { new: true },
  );

  log.info(`${MODULE_NAME}:${updateRole.name} (OUT) -> result: ${JSON.stringify(result)}`);
  return result;
}

async function getRoleById(id) {
  log.debug(`${MODULE_NAME}:${getRoleById.name} (IN) -> id: ${id}`);

  const result = await Role.findOne({ id });

  log.debug(`${MODULE_NAME}:${getRoleById.name} (OUT) -> result: ${JSON.stringify(result)}`);
  return result;
}

async function getRoleByName(name) {
  log.debug(`${MODULE_NAME}:${getRoleByName.name} (IN) -> name: ${name}`);

  const result = await Role.findOne({ name });

  log.debug(`${MODULE_NAME}:${getRoleByName.name} (OUT) -> result: ${JSON.stringify(result)}`);
  return result;
}

async function getRoleByFilter(filter) {
  log.debug(`${MODULE_NAME}:${getRoleByFilter.name} (IN) -> filter: ${JSON.stringify(filter)}`);

  const result = await Role.findOne(filter);

  log.debug(`${MODULE_NAME}:${getRoleByFilter.name} (OUT) -> result: ${JSON.stringify(result)}`);
  return result;
}

async function getAllRoles() {
  log.debug(`${MODULE_NAME}:${getAllRoles.name} (IN) -> no params`);

  const result = await Role.find({ });

  log.debug(`${MODULE_NAME}:${getAllRoles.name} (OUT) -> result: ${JSON.stringify(result)}`);
  return result;
}

async function deleteRoleById(roleId) {
  log.debug(`${MODULE_NAME}:${deleteRoleById.name} (IN) -> roleId: ${roleId}`);

  const innerResult = await Role.deleteOne({ id: roleId });
  log.debug(`${MODULE_NAME}:${deleteRoleById.name} (MID) -> innerResult: ${JSON.stringify(innerResult)}`);

  let result = false;
  if (innerResult.ok === 1 && innerResult.deletedCount === 1) {
    result = true;
  }

  log.debug(`${MODULE_NAME}:${deleteRoleById.name} (OUT) -> result: ${result}`);
  return result;
}

async function addFunc2Role(roleId, funcId) {
  log.info(`${MODULE_NAME}:${addFunc2Role.name} (IN) -> roleId: ${roleId}, funcId: ${funcId}`);

  const result = await Role.findOneAndUpdate(
    { id: roleId },
    { $addToSet: { functionalities: funcId } },
    { safe: true, new: true },
  );

  log.info(`${MODULE_NAME}:${addFunc2Role.name} (OUT) -> result: ${JSON.stringify(result)}`);
  return result;
}

async function delFunc2Role(roleId, funcId) {
  log.info(`${MODULE_NAME}:${addFunc2Role.name} (IN) -> roleId: ${roleId}, funcId: ${funcId}`);

  const result = await Role.findOneAndUpdate(
    { id: roleId },
    { $pull: { functionalities: funcId } },
    { safe: true, new: true },
  );

  log.info(`${MODULE_NAME}:${addFunc2Role.name} (OUT) -> result: ${JSON.stringify(result)}`);
  return result;
}

async function checkRoleExistsByFilter(filter, messageError) {
  const roleFound = await getRoleByFilter(filter);
  if (roleFound == null) {
    throw new Error(messageError);
  }
  return roleFound;
}

async function checkRoleNotExistsByFilter(filter, messageError) {
  const roleFound = await getRoleByFilter(filter);
  if (roleFound != null) {
    throw new Error(messageError);
  }
  return roleFound;
}

async function containsFunctionality(roleId, funcId) {
  log.info(`${MODULE_NAME}:${containsFunctionality.name} (IN) -> roleId: ${roleId}, funcId: ${funcId}`);

  let result = false;

  const roleFound = await Role.findOne({ id: roleId });

  let funcFound;
  if (roleFound != null && roleFound.functionalities !== undefined) {
    funcFound = roleFound.functionalities.find(element => element === funcId);
    result = (funcFound !== undefined);
  }
  return result;
}

module.exports = {
  createRole,
  updateRole,
  getRoleById,
  getRoleByName,
  getRoleByFilter,
  getAllRoles,
  deleteRoleById,
  addFunc2Role,
  delFunc2Role,
  checkRoleExistsByFilter,
  checkRoleNotExistsByFilter,
  containsFunctionality,
};
