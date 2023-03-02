const User = require("../models/user");

/**
 Error handler for standard API contrtoller
 @param err catched error
 @param res response object
 @param fName currect function/method name
 @param {...any} fArgs parameters that used by function/method
 */
function controllerErrorHandler(err, res, fName, ...fArgs) {
  // filter to show parameters
  const filt = (v) => (typeof v === "object" ? "Object" : v);
  console.debug(`- ${fName}(`, fArgs.map(filt), ") ERROR:");
  console.error(err);
  // respose with status 500 and error in body
  const message = err.toString();
  if (message.indexOf("violates foreign key constraint")) {
    res.status(500).send({ error: "Нарушение ссылочной целостности", errorDetails: message });
  } else {
    res.status(500).send({ error: message });
  }
}

/**
 * Send a response on update request
 * @param result response from database
 * @param res response Object
 */
function controllerUpdateHadler(result, res) {
  if (result === 0) {
    return res.sendStatus(404);
  }
  return res.status(200).send({ count: result });
}

/**
 * Send a single object in response from select query result
 * @param res response object
 * @param result result array from database
 */
function sendSigleResult(result, res) {
  if (Array.isArray(result)) {
    if (result.length) {
      return res.status(200).send(result[0]);
    }
    return res.sendStatus(404);
  }
  return res.status(200).send(result);
}

/**
 * Send a locked conflict response with an information about user that made the lock
 * @param {Response} res http response
 * @param {Object} lock result
 * @returns
 */
function sendLockedConflict(res, lock) {
  return User.getByUID(lock.user_uid)
    .first()
    .then((user) => res.status(409).send({ lock, user }))
    .catch((err) => controllerErrorHandler(err, res, "User.getByUID", lock.user_uid));
}

module.exports = { controllerErrorHandler, controllerUpdateHadler, sendSigleResult, sendLockedConflict };
