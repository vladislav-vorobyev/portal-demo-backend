/* eslint-disable func-names */
/* eslint-disable camelcase */

const db = require("../db");
const UM = require("../db/UM_tables");
const ldap = require("../services/ldap");
const stringExt = require("../utils/string-ext");

// User's main table fields
const userColumns = ["uid", "email", "display_name", "source", "status", "group_id", "job_title_id"];
// User's data table fields
const userDataColumns = [
  "first_name_lat",
  "last_name_lat",
  "first_name_ru",
  "second_name_ru",
  "last_name_ru",
  "photo",
  "is_private_photo",
];

class User {
  /**
   * @returns a model name that used for locking an entity
   */
  static get modelName() {
    return UM.USERS_TABLE;
  }

  /**
   * @returns an array of field names of user's main table
   */
  static get userColumns() {
    return userColumns;
  }

  /**
   * @returns an array of field names of user's data table
   */
  static get userDataColumns() {
    return userDataColumns;
  }

  /**
   * Prepare a user photo slug from stored data
   * @param {*} data 
   * @returns slug
   */
  static getPhotoSlug(data) {
    return data?.photo?.substr(0, 8) === 'default/' ? data.photo.substr(8) : '';
  }

  /**
   * Prepare a data for insert into two user tables
   * @param {*} data - array of user complex data
   * @returns data for main and data tables
   */
  static separateData(data) {
    const user = {};
    User.userColumns.forEach((v) => {
      if (data[v] !== undefined) user[v] = data[v];
    });
    const userData = {};
    User.userDataColumns.forEach((v) => {
      if (data[v] !== undefined) userData[v] = data[v];
    });
    return { user, userData };
  }

  /**
   * Make an insert into both user tables with transaction
   * @param {*} user 
   * @param {*} userData 
   * @returns user id
   */
  static insertWithData(user, userData) {
    return db.transaction((trx) =>
      trx(UM.USERS_TABLE)
        .insert(user)
        .returning("id")
        .then((_id) => {
          const { id } = _id[0];
          console.debug("creating user id:", id, typeof id);
          // eslint-disable-next-line no-param-reassign
          userData.user_id = id;
          return trx(UM.USERS_DATA_TABLE)
            .insert(userData)
            .then(() => id);
        })
    );
  }

  /**
   * Make an update into both user tables with transaction
   * @param {Integer} id - user id
   * @param {*} user 
   * @param {*} userData 
   */
  static updateWithData(id, user, userData) {
    return db.transaction((trx) =>
      trx(UM.USERS_TABLE)
        .where({ id })
        .update(user)
        .then(() => trx(UM.USERS_DATA_TABLE).where({ user_id: id }).update(userData))
    );
  }

  /*
   * User insert/update/delete
   */

  static insert(data) {
    const { user, userData } = User.separateData(data);
    return User.insertWithData(user, userData).then((id) =>
      User.getDefaultRoles().then((defaultRoles) => User.updateRoles(id, defaultRoles))
    );
  }

  static update(id, changes) {
    const { user, userData } = User.separateData(changes);
    return User.updateWithData(id, user, userData);
  }

  static delete(id) {
    return db(UM.USERS_TABLE).where({ id }).delete();
  }

  /*
   * Presets for select
   */

  static get() {
    return db
      .select(`${UM.USERS_TABLE}.*`, `${UM.USERS_DATA_TABLE}.*`)
      .from(UM.USERS_TABLE)
      .leftJoin(UM.USERS_DATA_TABLE, `${UM.USERS_TABLE}.id`, `${UM.USERS_DATA_TABLE}.user_id`);
  }

  static getFull() {
    return db
      .select(
        `${UM.USERS_TABLE}.*`,
        `${UM.USERS_DATA_TABLE}.*`,
        `${UM.GROUPS_TABLE}.slug as group_slug`,
        `${UM.GROUPS_TABLE}.name as group_name`,
        `${UM.JOB_TITLES_TABLE}.slug as job_title_slug`,
        `${UM.JOB_TITLES_TABLE}.name as job_title_name`
      )
      .from(UM.USERS_TABLE)
      .leftJoin(UM.USERS_DATA_TABLE, `${UM.USERS_TABLE}.id`, `${UM.USERS_DATA_TABLE}.user_id`)
      .leftJoin(UM.GROUPS_TABLE, `${UM.USERS_TABLE}.group_id`, `${UM.GROUPS_TABLE}.id`)
      .leftJoin(UM.JOB_TITLES_TABLE, `${UM.USERS_TABLE}.job_title_id`, `${UM.JOB_TITLES_TABLE}.id`);
  }

  /*
   * Single user functions
   */

  static getByID(id) {
    return User.get().where({ id });
  }

  static getFullByID(id) {
    return User.getFull()
      .where(`${UM.USERS_TABLE}.id`, id)
      .then((result) => User.mapWithRoles(result));
  }

  /**
   * Get users with pagination and filter
   * @param {integer} page
   * @param {integer} per_page
   * @param {Object} quiery { orderby, s, group, job_title, roles }
   * @returns [count, rows]
   */
  static getAll(page = 1, per_page = 10, quiery = {}) {
    // eslint-disable-next-line func-names
    const orderby = quiery?.orderby ?? "id";
    const where = function () {
      const s = quiery?.s ?? "";
      if (s) {
        this.where(function () {
          const mask = `%${s}%`;
          this.whereILike("display_name", mask).orWhereILike("email", mask);
        });
      }
      const groups = quiery?.groups ?? "";
      if (groups) {
        this.andWhere("group_id", "in", groups.split(","));
      }
      const job_titles = quiery?.job_titles ?? "";
      if (job_titles) {
        this.andWhere("job_title_id", "in", job_titles.split(","));
      }
      const roles = quiery?.roles ?? "";
      if (roles) {
        this.andWhere(
          `${UM.USERS_TABLE}.id`,
          "in",
          db.select("user_id").from(UM.ROLES2USERS_TABLE).where("role_id", "in", roles.split(","))
        );
      }
    };
    return Promise.all([
      db.count("* as count").from(UM.USERS_TABLE).where(where).first(),
      User.getFull()
        .where(where)
        .orderByRaw(orderby)
        .offset((page - 1) * per_page)
        .limit(per_page),
    ]);
  }

  /**
   * Get total count of users
   * @returns integer
   */
  static getCount() {
    return db(UM.USERS_TABLE)
      .count()
      .first()
      .then((res) => parseInt(res.count, 10));
  }

  /*
   * Roles functions
   */

  static setRole(id, roleId) {
    return db(UM.ROLES2USERS_TABLE).insert({ user_id: id, role_id: roleId });
  }

  static deleteRole(id, roleId) {
    return db(UM.ROLES2USERS_TABLE).where({ user_id: id, role_id: roleId }).delete();
  }

  static updateRoles(id, roleIds) {
    return db.transaction((trx) =>
      trx(UM.ROLES2USERS_TABLE)
        .where({ user_id: id })
        .delete()
        .then(() =>
          trx(UM.ROLES2USERS_TABLE).insert(
            roleIds.map((_id) => ({ user_id: id, role_id: typeof _id === "object" ? _id.id : _id }))
          )
        )
    );
  }

  static getRoles(id) {
    return db
      .select("*")
      .from(UM.ROLES_TABLE)
      .innerJoin(UM.ROLES2USERS_TABLE, `${UM.ROLES_TABLE}.id`, `${UM.ROLES2USERS_TABLE}.role_id`)
      .where({ user_id: id });
  }

  /*
   * UID functions
   */

  static getByUID(uid) {
    return User.get().where({ uid });
  }

  static getFullByUID(uid) {
    return User.getFull()
      .where(`${UM.USERS_TABLE}.uid`, uid)
      .then((result) => User.mapWithRoles(result));
  }

  static getRolesByUID(uid) {
    return db
      .select("*")
      .from(UM.ROLES_TABLE)
      .innerJoin(UM.ROLES2USERS_TABLE, `${UM.ROLES_TABLE}.id`, `${UM.ROLES2USERS_TABLE}.role_id`)
      .innerJoin(UM.USERS_TABLE, `${UM.USERS_TABLE}.id`, `${UM.ROLES2USERS_TABLE}.user_id`)
      .where(`${UM.USERS_TABLE}.uid`, uid);
  }

  /**
   * Get User roles slugs as simple array
   * @param { String } uid User UID
   * @returns { Promise<Array> }
   */
  static getRolesAsSlugByUID(uid) {
    return db
      .select("id")
      .from(UM.USERS_TABLE)
      .where({ uid })
      .first()
      .then((_id) => User.getRolesAsSlugs(_id.id));
  }

  /**
   * Get User roles slugs as simple array
   * @param { Integer } id User id
   * @returns { Promise<Array> }
   */
  static getRolesAsSlugs(id) {
    return db
      .select("slug")
      .from(UM.ROLES_TABLE)
      .innerJoin(UM.ROLES2USERS_TABLE, `${UM.ROLES_TABLE}.id`, `${UM.ROLES2USERS_TABLE}.role_id`)
      .where({ user_id: id })
      .then((result) => result.map((v) => v.slug));
  }

  /**
   * Add a roles to each user
   * @param { Array } result array of selected users
   * @returns { Promise<Array> }
   */
  static mapWithRoles(result) {
    return Promise.all(
      result.map((_u) =>
        User.getRolesAsSlugs(_u.id).then((roles) => {
          // eslint-disable-next-line no-param-reassign
          _u.roles = roles;
          return _u;
        })
      )
    );
  }

  /**
   * Get ids array of default roles
   * @returns { Promise<Array> }
   */
  static getDefaultRoles() {
    return db(UM.ROLES_TABLE)
      .select("id")
      .where({ default: true })
      .then((roles) => roles.map((v) => (typeof v === "object" ? v.id : v)));
  }

  /**
   * Fetching all users from LDAP and try to insert or update
   * @returns { Promise<void> }
   */
  static updateFromLDAP() {
    return ldap.fetchAll().then((users) =>
      User.getDefaultRoles().then((defaultRoles) =>
        // insert or update all fetched users
        Promise.all(
          users.map((_u) => {
            // prepare data for user and user_data tables
            const source = _u.source || "ldap";
            const names = _u.display_name?.trim().split(/[\s]+/) || [];
            const first_name_ru = _u.first_name_ru || _u.first_name_lat || names[0] || "";
            const last_name_ru = _u.last_name_ru || _u.last_name_lat || names[1] || "";
            const second_name_ru = _u.second_name_ru || names[2] || "";
            const first_name_lat = _u.first_name_lat || stringExt.translitRusToZagran(first_name_ru);
            const last_name_lat = _u.last_name_lat || stringExt.translitRusToZagran(last_name_ru);
            const display_name = _u.display_name || `${first_name_ru} ${last_name_ru}`;
            const user = {
              uid: _u.uid,
              email: _u.email,
              display_name,
              source,
            };
            const userData = {
              first_name_lat,
              last_name_lat,
              first_name_ru,
              second_name_ru,
              last_name_ru,
            };
            // console.log("+ User:", user, userData);
            // check a user by uid
            return db(UM.USERS_TABLE)
              .where({ uid: user.uid })
              .then((_f) => {
                if (_f.length) {
                  // update user + user_data
                  const { id } = _f[0];
                  console.log("UID:", user.uid, "update", id);
                  return User.updateWithData(id, user, userData);
                }
                // insert user + user_data and then set default roles
                console.log("UID:", user.uid, "insert");
                return User.insertWithData(user, userData).then((id) => User.updateRoles(id, defaultRoles));
              });
          })
        )
      )
    );
  }
}

module.exports = User;
