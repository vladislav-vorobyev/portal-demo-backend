/* eslint-disable camelcase */
const moment = require("moment");

const db = require("../db");
const UM = require("../db/UM_tables");

const PGDATETIME_FORMAT = "YYYY-MM-DDTHH:mm:ssZ";

class Lock {
  static get(object, object_id) {
    return db(UM.LOCKS_TABLE).where({ object, object_id }).first();
  }

  static insert(user_uid, object, object_id) {
    return db(UM.LOCKS_TABLE).insert({ user_uid, object, object_id });
  }

  static upsert(user_uid, object, object_id) {
    return db.transaction((trx) =>
      trx(UM.LOCKS_TABLE)
        .where({ user_uid, object, object_id })
        .delete()
        .then(() => trx(UM.LOCKS_TABLE).insert({ user_uid, object, object_id }))
    );
  }

  static delete(user_uid, object, object_id) {
    return db(UM.LOCKS_TABLE).where({ user_uid, object, object_id }).delete();
  }

  static getByUser(user_uid) {
    return db(UM.LOCKS_TABLE).where({ user_uid });
  }

  static getByFilter(filter) {
    return db(UM.LOCKS_TABLE).where(filter);
  }

  static deleteExpired(limit) {
    if (!limit) {
      return Promise.reject(new Error("Please setup a limit to delete expired locks!"));
    }

    const cutTime = moment(Date.now()).subtract(limit, "seconds").format(PGDATETIME_FORMAT);
    console.log("Delete expired locks | cut time:", cutTime);
    return db(UM.LOCKS_TABLE).where("created_at", "<", cutTime).delete();
  }
}

module.exports = Lock;
