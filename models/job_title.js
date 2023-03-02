const db = require("../db");
const UM = require("../db/UM_tables");

class JobTitle {
  static get modelName() {
    return UM.JOB_TITLES_TABLE;
  }

  static insert(data) {
    return db(UM.JOB_TITLES_TABLE).insert(data);
  }

  static update(id, changes) {
    return db(UM.JOB_TITLES_TABLE).where({ id }).update(changes);
  }

  static delete(id) {
    return db(UM.JOB_TITLES_TABLE).where({ id }).delete();
  }

  static getByID(id) {
    return db(UM.JOB_TITLES_TABLE).where({ id });
  }

  static getBySlug(slug) {
    return db(UM.JOB_TITLES_TABLE).where({ slug });
  }

  static getAll() {
    return db(UM.JOB_TITLES_TABLE).orderBy("id");
  }
}

module.exports = JobTitle;
