const Role = require("../models/role");
const Lock = require("../models/lock");
const Ext = require("../utils/controllers-ext");

/**
 * Response with array of roles as records
 * @param {*} req - Request object
 * @param {*} res - Response object
 */
exports.getRoles = (req, res) =>
  Role.getAll()
    .then((result) => res.status(200).send(result))
    .catch((err) => Ext.controllerErrorHandler(err, res, "Role.getAll"));

/**
 * Response with role data
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.uid - record id
 */
exports.getRole = (req, res) =>
  Role.getByID(req.params.id)
    .then((result) => Ext.sendSigleResult(result, res))
    .catch((err) => Ext.controllerErrorHandler(err, res, "Role.getByID", req.params.id));

/**
 * Find a role by slug
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {String} req.params.slug - role unique id
 */
exports.getRoleBySlug = (req, res) =>
  Role.getBySlug(req.params.slug)
    .then((result) => Ext.sendSigleResult(result, res))
    .catch((err) => Ext.controllerErrorHandler(err, res, "Role.getBySlug", req.params.slug));

/**
 * Insert new role
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {*} req.body - role data
 */
exports.newRole = (req, res) =>
  Role.insert(req.body)
    .then(() => res.sendStatus(204))
    .catch((err) => Ext.controllerErrorHandler(err, res, "Role.insert", req.body));

/**
 * Update role
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.uid - record id
 * @param {*} req.body - role data
 */
exports.updateRole = (req, res) =>
  Role.update(req.params.id, req.body)
    .then((result) => Ext.controllerUpdateHadler(result, res))
    .catch((err) => Ext.controllerErrorHandler(err, res, "Role.update", req.params.id, req.body));

/**
 * Delete role
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.uid - record id
 */
exports.deleteRole = (req, res) =>
  Lock.get(Role.modelName, req.params.id)
    .then((lock) =>
      lock ? Ext.sendLockedConflict(res, lock) : Role.delete(req.params.id).then(() => res.sendStatus(204))
    )
    .catch((err) => Ext.controllerErrorHandler(err, res, "Role.delete", req.params.id));
