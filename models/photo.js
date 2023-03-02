/* eslint-disable camelcase */
const moment = require("moment");

const db = require("../db");
const UM = require("../db/UM_tables");

class Photo {
  static insert(data) {
    // eslint-disable-next-line no-param-reassign
    data.slug = moment().format("YYYYMMDDHHmmss");
    console.log("Photo slug:", data.slug);
    return db(UM.PHOTOS_TABLE)
      .insert(data)
      .then(() => data.slug);
  }

  static getByUser(user_id) {
    return db(UM.PHOTOS_TABLE).where({ user_id });
  }

  static getByUserAndSlug(user_id, slug) {
    return db(UM.PHOTOS_TABLE).where({ user_id, slug });
  }

  static cleanupByUserAndSlug(user_id, slug) {
    console.log('Photo cleanup for', user_id, 'preserve only', slug)
    return db(UM.PHOTOS_TABLE).where({ user_id }).andWhere("slug", "<>", slug).delete();
  }

  static deleteByUser(user_id) {
    return db(UM.PHOTOS_TABLE).where({ user_id }).delete();
  }
}

module.exports = Photo;
