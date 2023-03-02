const db = require("../db");
const UM = require("../db/UM_tables");

class Group {
  static get modelName() {
    return UM.ROLES_TABLE;
  }

  static insert(data) {
    return db(UM.GROUPS_TABLE).insert(data);
  }

  static update(id, changes) {
    return db(UM.GROUPS_TABLE).where({ id }).update(changes);
  }

  static delete(id) {
    return db(UM.GROUPS_TABLE).where({ id }).delete();
  }

  static getByID(id) {
    return db(UM.GROUPS_TABLE).where({ id });
  }

  static getBySlug(slug) {
    return db(UM.GROUPS_TABLE).where({ slug });
  }

  static getAll() {
    return db(UM.GROUPS_TABLE).orderBy("id");
  }
}

module.exports = Group;
