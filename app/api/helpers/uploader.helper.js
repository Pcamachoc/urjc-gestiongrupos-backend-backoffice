// uploader.helper.js

const multer = require('multer');
const bodyParser = require('body-parser');

const log = require('../infrastructure/logger/applicationLogger.gateway');
const fileHelper = require('../helpers/file.helper');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[Uploader Helper]';

const DEFAULT_UPLOAD_FOLDER = 'uploads';
const DEFAULT_FILE_UPLD_MAX_LENGTH = 5; // MBytes
const DEFAULT_PARAMETER_LIMIT = 500000;

const ERROR_FILE_REQUIRED_NOT_UPLOADED = 'Required file not found when uploading';
const ERROR_FILE_BAD_FORMAT = 'Bad format of file. Extensions allowed:';
const ERROR_FILE_NOT_FOUND_IN_UPLOAD = 'No file uploaded';

// //////////////////////////////////////////////////////////////////////////////
// PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

let uploadingFolder;
let fileUploadedMaxLength;

// //////////////////////////////////////////////////////////////////////////////
// PRIVATE METHODS
// //////////////////////////////////////////////////////////////////////////////

function prepareUploadApi(uploadApiOptions, uploadMulter, app) {
  log.debug(`${MODULE_NAME}:${prepareUploadApi.name} (IN) --> uploadApiOptions: ${JSON.stringify(uploadApiOptions)}, uploadMulter: <<uploadMulter>>, app: <<app>>`);
  uploadApiOptions.forEach((element) => {
    log.debug(`${MODULE_NAME}:${prepareUploadApi.name} (MID) --> apiMethod: ${element.apiMethod}, fields: ${JSON.stringify(element.fields)}`);
    app.use(element.apiMethod, uploadMulter.fields(element.fields));
  });
  log.debug(`${MODULE_NAME}:${prepareUploadApi.name} (OUT) --> UploadApi prepared OK`);
}

function getFileFromRequest(req, filename) {
  let fileResult;
  if (req.files !== undefined && req.files[filename] !== undefined
    && req.files[filename][0] !== undefined) {
    [fileResult] = req.files[filename]; // Get the first element of the array returned
  }
  return fileResult;
}

function checkExtension(filename, arrayExtensions) {
  let result = false;
  if (arrayExtensions !== undefined && arrayExtensions.length > 0) {
    result = arrayExtensions.some(element => filename.endsWith(`.${element}`));
  }
  return result;
}

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC METHODS
// //////////////////////////////////////////////////////////////////////////////

function initUploader(options, app) {
  log.debug(`${MODULE_NAME}:${initUploader.name} (IN) --> options: ${JSON.stringify(options)}, app: <<app>>`);

  uploadingFolder = options.uploadFolder || DEFAULT_UPLOAD_FOLDER;
  fileUploadedMaxLength = options.fileUploadedMaxLength || DEFAULT_FILE_UPLD_MAX_LENGTH;

  log.debug(`${MODULE_NAME}:${initUploader.name} (MID) --> uploadingFolder: ${uploadingFolder}, fileUploadedMaxLength: ${fileUploadedMaxLength} MB`);
  const uploadMulter = multer({
    dest: uploadingFolder,
    limits: { fileSize: Number(fileUploadedMaxLength * 1024 * 1024) },
  });

  // Prepare uploadapi for multipart request
  if (options.uploadApi != null && options.uploadApi.length > 0) {
    prepareUploadApi(options.uploadApi, uploadMulter, app);
  }

  // Prepare for large body & urlencoded
  app.use(bodyParser.json({ limit: `${options.fileUploadedMaxLength}mb` }));
  app.use(bodyParser.urlencoded({ limit: `${options.fileUploadedMaxLength}mb`, extended: true, parameterLimit: DEFAULT_PARAMETER_LIMIT }));

  log.debug(`${MODULE_NAME}:${initUploader.name} (OUT) --> uploader initialized OK`);
}

async function handleUploadedFile(req, filenamereq, mandatoryCheck, extensionCheck, arrayExt) {
  log.debug(`${MODULE_NAME}:${handleUploadedFile.name} (IN) --> req: <<req>>, filenamereq: ${filenamereq}, 
  mandatoryCheck: ${mandatoryCheck}, extensionCheck: ${extensionCheck}, arrayExt: ${JSON.stringify(arrayExt)}`);

  let richFileResult;

  const file = getFileFromRequest(req, filenamereq);

  if (file === undefined) {
    if (mandatoryCheck) {
      log.error(`${MODULE_NAME}:${handleUploadedFile.name} (ERROR) --> File required not uploaded`);
      throw Error(`${ERROR_FILE_REQUIRED_NOT_UPLOADED}: ${filenamereq}`);
    } else {
      log.debug(`${MODULE_NAME}:${handleUploadedFile.name} (MID) --> File not uploaded`);
    }
  } else {
    const resultExtensionCheck = checkExtension(file.originalname, arrayExt);
    if (extensionCheck && !resultExtensionCheck) {
      log.error(`${MODULE_NAME}:${handleUploadedFile.name} (ERROR) --> File extension not allowed`);
      throw Error(`${ERROR_FILE_BAD_FORMAT}: ${JSON.stringify(arrayExt)}`);
    }

    log.debug(`${MODULE_NAME}:${handleUploadedFile.name} (MID) --> File uploaded OK`);

    // Load file from path
    const buffer = await fileHelper.loadFile(file.path);
    // Build rich file
    richFileResult = fileHelper.buildRichFile(buffer, file.originalname);
    // Delete file uploaded from upload folder
    await fileHelper.deleteFile(file.path);
  }

  log.debug(`${MODULE_NAME}:${handleUploadedFile.name} (OUT) --> richFileResult: <<richFileResult>>`);
  return richFileResult;
}

module.exports = {
  ERROR_FILE_REQUIRED_NOT_UPLOADED,
  ERROR_FILE_BAD_FORMAT,
  ERROR_FILE_NOT_FOUND_IN_UPLOAD,
  initUploader,
  handleUploadedFile,
};
