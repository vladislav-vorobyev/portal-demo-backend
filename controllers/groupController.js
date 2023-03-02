const Group = require("../models/group");
const Lock = require("../models/lock");
const Ext = require("../utils/controllers-ext");

/**
 * Response with array of groups as records
 * @param {*} req - Request object
 * @param {*} res - Response object
 */
exports.getGroups = (req, res) =>
  Group.getAll()
    .then((result) => res.status(200).send(result))
    .catch((err) => Ext.controllerErrorHandler(err, res, "Group.getAll"));

/**
 * Response with group data
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.uid - record id
 */
exports.getGroup = (req, res) =>
  Group.getByID(req.params.id)
    .then((result) => Ext.sendSigleResult(result, res))
    .catch((err) => Ext.controllerErrorHandler(err, res, "Group.getByID", req.params.id));

/**
 * Find a group by slug
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {String} req.params.slug - group unique id
 */
exports.getGroupBySlug = (req, res) =>
  Group.getBySlug(req.params.slug)
    .then((result) => Ext.sendSigleResult(result, res))
    .catch((err) => Ext.controllerErrorHandler(err, res, "Group.getBySlug", req.params.slug));

/**
 * Insert new group
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {*} req.body - group data
 */
exports.newGroup = (req, res) =>
  Group.insert(req.body)
    .then(() => res.sendStatus(204))
    .catch((err) => Ext.controllerErrorHandler(err, res, "Group.insert", req.body));

/**
 * Update group
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.uid - record id
 * @param {*} req.body - group data
 */
exports.updateGroup = (req, res) =>
  Group.update(req.params.id, req.body)
    .then((result) => Ext.controllerUpdateHadler(result, res))
    .catch((err) => Ext.controllerErrorHandler(err, res, "Group.update", req.params.id, req.body));

/**
 * Delete group
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.uid - record id
 */
exports.deleteGroup = (req, res) =>
  Lock.get(Group.modelName, req.params.id)
    .then((lock) =>
      lock ? Ext.sendLockedConflict(res, lock) : Group.delete(req.params.id).then(() => res.sendStatus(204))
    )
    .catch((err) => Ext.controllerErrorHandler(err, res, "Group.delete", req.params.id));
