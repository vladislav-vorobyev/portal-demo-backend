const Lock = require("../models/lock");
const Ext = require("../utils/controllers-ext");

/**
 * Response with lock data
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {String} req.params.object - locking object name
 * @param {Integer} req.params.object_id - locking object id
 */
exports.get = (req, res) =>
  Lock.get(req.params.object, req.params.object_id)
    .then((result) => res.status(200).send(result))
    .catch((err) => Ext.controllerErrorHandler(err, res, "Lock.get", req.params.object, req.params.object_id));

/**
 * Create new lock
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {String} req.params.object - locking object name
 * @param {Integer} req.params.object_id - locking object id
 */
exports.newLock = (req, res) =>
  Lock.get(req.params.object, req.params.object_id)
    .then((lock) => {
      if (lock) {
        return Ext.sendLockedConflict(res, lock);
      }
      return Lock.insert(req.params.uid, req.params.object, req.params.object_id)
        .then(() => res.sendStatus(204))
        .catch((err) =>
          // prettier-ignore
          Ext.controllerErrorHandler(err, res, "Lock.insert", req.params.uid, req.params.object, req.params.object_id)
        );
    })
    .catch((err) => Ext.controllerErrorHandler(err, res, "Lock.get", req.params.object, req.params.object_id));

/**
 * Update a lock
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {String} req.params.object - locking object name
 * @param {Integer} req.params.object_id - locking object id
 */
exports.updateLock = (req, res) =>
  Lock.get(req.params.object, req.params.object_id)
    .then((lock) => {
      if (lock && lock.user_uid !== req.params.uid) {
        return Ext.sendLockedConflict(res, lock);
      }
      return Lock.upsert(req.params.uid, req.params.object, req.params.object_id)
        .then(() => res.sendStatus(204))
        .catch((err) =>
          // prettier-ignore
          Ext.controllerErrorHandler(err, res, "Lock.upsert", req.params.uid, req.params.object, req.params.object_id)
        );
    })
    .catch((err) => Ext.controllerErrorHandler(err, res, "Lock.get", req.params.object, req.params.object_id));

/**
 * Delete a lock
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {String} req.params.object - locking object name
 * @param {Integer} req.params.object_id - locking object id
 */
exports.deleteLock = (req, res) =>
  Lock.delete(req.params.uid, req.params.object, req.params.object_id)
    .then(() => res.sendStatus(204))
    .catch((err) =>
      Ext.controllerErrorHandler(err, res, "Lock.delete", req.params.uid, req.params.object, req.params.object_id)
    );

/**
 * Find locks by user
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {String} req.params.uid - user unique id
 */
exports.getByUser = (req, res) =>
  Lock.getByUser(req.params.uid)
    .then((result) => Ext.sendSigleResult(result, res))
    .catch((err) => Ext.controllerErrorHandler(err, res, "Lock.getByUser", req.params.uid));

/**
 * Find locks by filter
 * @param {*} req - Request object
 * @param {*} res - Response object
 * @param {St*ing} req.body - filter query
 */
exports.getByFilter = (req, res) =>
  Lock.getByFilter(req.body)
    .then((result) => res.status(200).send(result))
    .catch((err) => Ext.controllerErrorHandler(err, res, "Lock.getByFilter", req.body));
