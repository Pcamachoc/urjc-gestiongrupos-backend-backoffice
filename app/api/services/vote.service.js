// vote.service.js
const uniqid = require('uniqid');
const parse = require('csv-parse/lib/sync');
const parseToCSV = require('json2csv').parse;
const log = require('../infrastructure/logger/applicationLogger.gateway');
const voteRepository = require('../repositories/vote/middlewarehlf.vote.repository');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[Call Service]';

const { ERROR_CALL_NOT_FOUND, ERROR_WRONG_DATE_UPLOAD, ERROR_VOTING_CLOSED } = voteRepository;
const SUCCESS = 'SUCCESS';
const MESSAGE_OK_OBJECT = {
  message: 'OK',
};
const INPERSON_TYPE = 'inperson';
const CSV_HEADER = ['idParticipant', '[idProposal1]#[descriptionProposal1]', '[idProposal2]#[descriptionProposal2]', '[idProposalN]#[descriptionProposalN]'];

// //////////////////////////////////////////////////////////////////////////////
// PRIVATE FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////
function getListVotesFromBase64(params) {
  log.debug(`${MODULE_NAME}:${getListVotesFromBase64.name} (IN) --> params: ${JSON.stringify(params)}`);
  const bufferFromBase64 = Buffer.from(params.csvFileBase64.file, 'base64');
  const options = {
    bom: true,
    delimiter: ',',
    skip_empty_lines: true,
  };
  const listFromBuffer = parse(bufferFromBase64.toString(), options);

  log.debug(`${MODULE_NAME}:${getListVotesFromBase64.name} (MID) --> listFromBuffer: <<listFromBuffer>>`);
  // Loop through the CSV votes to parse them into JSON
  const result = [];
  let jsonElem;
  let bufferElem;
  let voteProposals;
  let proposal;
  const listHeader = listFromBuffer[0];
  for (let i = 1; i < listFromBuffer.length; i += 1) {
    bufferElem = listFromBuffer[i];
    jsonElem = {};
    jsonElem.id = uniqid();
    jsonElem.idCall = params.callId;
    [jsonElem.idParticipant] = bufferElem;
    voteProposals = [];
    for (let j = 1; j < listHeader.length; j += 1) {
      proposal = {};
      [proposal.idProposal] = listHeader[j].split('#');
      proposal.option = bufferElem[j];
      voteProposals.push(proposal);
    }
    jsonElem.proposalsVote = voteProposals;
    jsonElem.type = INPERSON_TYPE;
    result.push(jsonElem);
  }
  log.debug(`${MODULE_NAME}:${getListVotesFromBase64.name} (OUT) --> listFromBuffer: <<listFromBuffer>>`);
  return result;
}

function generateCSVTemplate() {
  const result = parseToCSV(CSV_HEADER, {
    fields: CSV_HEADER,
  });
  return Buffer.from(result);
}

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function createInPersonVotes(params) {
  log.debug(`${MODULE_NAME}:${createInPersonVotes.name} (IN) --> params: ${JSON.stringify(params)}`);

  const paramVotes = {};
  paramVotes.listVotes = getListVotesFromBase64(params);

  let result = await voteRepository.createInPersonVotes(paramVotes);

  if (result !== undefined && result[0].status !== undefined && result[0].status === SUCCESS) {
    result = MESSAGE_OK_OBJECT;
  }
  log.debug(`${MODULE_NAME}:${createInPersonVotes.name} (OUT) --> result: ${JSON.stringify(result)}`);
  return result;
}

function getInPersonResultsCSVTemplate(params) {
  log.debug(`${MODULE_NAME}:${getInPersonResultsCSVTemplate.name} (IN) --> params: ${JSON.stringify(params)}`);

  const result = generateCSVTemplate();

  log.debug(`${MODULE_NAME}:${getInPersonResultsCSVTemplate.name} (OUT) --> result: ${JSON.stringify(result)}`);
  return result;
}

module.exports = {
  ERROR_CALL_NOT_FOUND,
  ERROR_WRONG_DATE_UPLOAD,
  ERROR_VOTING_CLOSED,
  createInPersonVotes,
  getInPersonResultsCSVTemplate,
};
