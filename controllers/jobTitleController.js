const JobTitle = require("../models/job_title");
const Lock = require("../models/lock");
const Ext = require("../utils/controllers-ext");

/**
 * Response with array of job titles as records
 * @param {*} req - Request object
 * @param {*} res - Response object
 */
exports.getJobTitles = (req, res) =>
  JobTitle.getAll()
    .then((result) => res.status(200).send(result))
    .catch((err) => Ext.controllerErrorHandler(err, res, "JobTitle.getAll"));

/**
 * Response with job title data
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.uid - record id
 */
exports.getJobTitle = (req, res) =>
  JobTitle.getByID(req.params.id)
    .then((result) => Ext.sendSigleResult(result, res))
    .catch((err) => Ext.controllerErrorHandler(err, res, "JobTitle.getByID", req.params.id));

/**
 * Find a job title by slug
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {String} req.params.slug - job title unique id
 */
exports.getJobTitleBySlug = (req, res) =>
  JobTitle.getBySlug(req.params.slug)
    .then((result) => Ext.sendSigleResult(result, res))
    .catch((err) => Ext.controllerErrorHandler(err, res, "JobTitle.getBySlug", req.params.slug));

/**
 * Insert new job title
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {*} req.body - job title data
 */
exports.newJobTitle = (req, res) =>
  JobTitle.insert(req.body)
    .then(() => res.sendStatus(204))
    .catch((err) => Ext.controllerErrorHandler(err, res, "JobTitle.insert", req.body));

/**
 * Update job title
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.uid - record id
 * @param {*} req.body - job title data
 */
exports.updateJobTitle = (req, res) =>
  JobTitle.update(req.params.id, req.body)
    .then((result) => Ext.controllerUpdateHadler(result, res))
    .catch((err) => Ext.controllerErrorHandler(err, res, "JobTitle.update", req.params.id, req.body));

/**
 * Delete job title
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.uid - record id
 */
exports.deleteJobTitle = (req, res) =>
  Lock.get(JobTitle.modelName, req.params.id)
    .then((lock) =>
      lock ? Ext.sendLockedConflict(res, lock) : JobTitle.delete(req.params.id).then(() => res.sendStatus(204))
    )
    .catch((err) => Ext.controllerErrorHandler(err, res, "JobTitle.delete", req.params.id));
