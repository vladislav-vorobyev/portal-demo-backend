/* eslint-disable camelcase */

const User = require("../models/user");
const Role = require("../models/role");
const Photo = require("../models/photo");
const Lock = require("../models/lock");
const Ext = require("../utils/controllers-ext");
const auth = require("../utils/auth");

/**
 * Response with structure { uid, roles, status }
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {String} req.params.uid - user unique id
 */
exports.getAuthInfo = (req, res) =>
  auth
    .getRoles(req.params.uid)
    .then((roles) => res.status(200).send({ uid: req.params.uid, roles, status: "Authenticated" }))
    .catch((err) => Ext.controllerErrorHandler(err, res, "auth.getRoles", req.params.uid));

/**
 * Response with array of user roles
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {String} req.params.uid - user unique id
 */
exports.getAuthRoles = (req, res) =>
  auth
    .getRoles(req.params.uid)
    .then((roles) => res.status(200).send(roles))
    .catch((err) => Ext.controllerErrorHandler(err, res, "auth.getRoles", req.params.uid));

/**
 * Make sync users from LDAP
 * @param {*} req - Request object
 * @param {*} res - Response object
 */
exports.syncUsers = (req, res) =>
  User.getCount().then((count) =>
    User.updateFromLDAP()
      .then(() => {
        if (count === 0) {
          // Users init mode: set all roles to current user
          return User.getByUID(auth.UID(req))
            .first()
            .then((_u) => {
              console.log("Set all roles to user:", _u);
              if (!_u?.id) {
                return res.status(500).send({ error: "Current user is not found" });
              }
              return Role.getAll().then((_roles) =>
                User.updateRoles(
                  _u.id,
                  _roles.map((v) => v.id)
                ).then(() => res.sendStatus(204))
              );
            });
        }
        return res.sendStatus(204);
      })
      .catch((err) => Ext.controllerErrorHandler(err, res, "User.updateFromLDAP"))
  );

/**
 * Response with users array
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.page - current page
 * @param {Integer} req.params.per_page - size per page
 * @param {String} req.params.query - search and order by params
 */
exports.getUsers = (req, res) => {
  const current_page = parseInt(req.params.page, 10) || 1;
  const per_page = parseInt(req.params.per_page, 10) || 10;
  return User.getAll(current_page, per_page, req.query)
    .then(([total, rows]) =>
      res.status(200).send({
        total: parseInt(total.count, 10),
        current_page,
        per_page,
        last_page: Math.ceil(total.count / per_page),
        data: rows,
      })
    )
    .catch((err) => Ext.controllerErrorHandler(err, res, "User.getAll"));
};

/**
 * Response with user data
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.id - record id
 */
exports.getUser = (req, res) =>
  User.getByID(req.params.id)
    .then((result) => Ext.sendSigleResult(result, res))
    .catch((err) => Ext.controllerErrorHandler(err, res, "User.getByID", req.params.id));

/**
 * Response with complete user data
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.id - record id
 */
exports.getFullUser = (req, res) =>
  User.getFullByID(req.params.id)
    .then((result) => Ext.sendSigleResult(result, res))
    .catch((err) => Ext.controllerErrorHandler(err, res, "User.getFullByID", req.params.id));

/**
 * Insert new user
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {*} req.body - user data
 */
exports.newUser = (req, res) =>
  User.insert(req.body)
    .then(() => res.sendStatus(204))
    .catch((err) => Ext.controllerErrorHandler(err, res, "User.insert", req.body));

/**
 * Update user data
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.id - record id
 * @param {*} req.body - user data
 */
exports.updateUser = (req, res) =>
  User.update(req.params.id, req.body)
    .then((result) => {
      if (result !== 0) Photo.cleanupByUserAndSlug(req.params.id, User.getPhotoSlug(req.body));
      return result;
    })
    .then((result) => Ext.controllerUpdateHadler(result, res))
    .catch((err) => Ext.controllerErrorHandler(err, res, "User.update", req.params.id, req.body));

/**
 * Delete user record
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.id - record id
 */
exports.deleteUser = (req, res) =>
  Lock.get(User.modelName, req.params.id)
    .then((lock) =>
      lock ? Ext.sendLockedConflict(res, lock) : User.delete(req.params.id).then(() => res.sendStatus(204))
    )
    .catch((err) => Ext.controllerErrorHandler(err, res, "User.delete", req.params.id));

/**
 * Response with array of user roles as records
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.id - user id
 */
exports.getRoles = (req, res) =>
  User.getRoles(req.params.id)
    .then((result) => res.status(200).send(result))
    .catch((err) => Ext.controllerErrorHandler(err, res, "User.getRoles", req.params.id));

/**
 * Response with array of user roles as slug values
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.id - user id
 */
exports.getRolesAsSlugs = (req, res) =>
  User.getRolesAsSlugs(req.params.id)
    .then((result) => res.status(200).send(result))
    .catch((err) => Ext.controllerErrorHandler(err, res, "User.getRolesAsSlugs", req.params.id));

/**
 * Set a role to user
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.id - user id
 * @param {Integer} req.params.roleId - role id
 */
exports.setRole = (req, res) =>
  User.setRole(req.params.id, req.params.roleId)
    .then(() => res.sendStatus(204))
    .catch((err) => Ext.controllerErrorHandler(err, res, "User.setRole", req.params.id, req.params.roleId));

/**
 * Delete a role from user
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.id - user id
 * @param {Integer} req.params.roleId - role id
 */
exports.deleteRole = (req, res) =>
  User.deleteRole(req.params.id, req.params.roleId)
    .then(() => res.sendStatus(204))
    .catch((err) => Ext.controllerErrorHandler(err, res, "User.deleteRole", req.params.id, req.params.roleId));

/**
 * Update roles list of user
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {Integer} req.params.id - user id
 * @param {*} req.body - roles list
 */
exports.updateRoles = (req, res) =>
  User.updateRoles(req.params.id, req.body)
    .then(() => res.sendStatus(204))
    .catch((err) => Ext.controllerErrorHandler(err, res, "User.updateRoles", req.params.id, req.body));

/**
 * Response with user data
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {String} req.params.uid - user unique id
 */
exports.getUserByUID = (req, res) =>
  User.getByUID(req.params.uid)
    .then((result) => Ext.sendSigleResult(result, res))
    .catch((err) => Ext.controllerErrorHandler(err, res, "User.getByUID", req.params.uid));

/**
 * Response with complete user data
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {String} req.params.uid - user unique id
 */
exports.getFullUserByUID = (req, res) =>
  User.getFullByUID(req.params.uid)
    .then((result) => Ext.sendSigleResult(result, res))
    .catch((err) => Ext.controllerErrorHandler(err, res, "User.getFullByUID", req.params.uid));

/**
 * Response with array of user roles as records
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {String} req.params.uid - user unique id
 */
exports.getRolesByUID = (req, res) =>
  User.getRolesByUID(req.params.uid)
    .then((result) => res.status(200).send(result))
    .catch((err) => Ext.controllerErrorHandler(err, res, "User.getRolesByUID", req.params.uid));

/**
 * Response with array of user roles as slug values
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {String} req.params.uid - user unique id
 */
exports.getRolesAsSlugsByUID = (req, res) =>
  User.getRolesAsSlugByUID(req.params.uid)
    .then((result) => res.status(200).send(result))
    .catch((err) => Ext.controllerErrorHandler(err, res, "User.getRolesAsSlugsByUID", req.params.uid));
