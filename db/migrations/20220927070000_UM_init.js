/* eslint-disable func-names */

const UM = require("../UM_tables");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return Promise.all([
    // job_titles
    knex.schema.createTable(UM.JOB_TITLES_TABLE, (table) => {
      table.increments("id").primary();
      table.string("slug").unique().notNullable().index();
      table.string("name").notNullable();
    }),

    // groups
    knex.schema.createTable(UM.GROUPS_TABLE, (table) => {
      table.increments("id").primary();
      table.integer("parent_id").unsigned().index().references("id").inTable(UM.GROUPS_TABLE).onDelete("CASCADE");
      table.string("slug").unique().notNullable().index();
      table.string("name").notNullable();
    }),

    // roles
    knex.schema.createTable(UM.ROLES_TABLE, (table) => {
      table.increments("id").primary();
      table.string("slug").unique().notNullable().index();
      table.string("name").notNullable();
      table.boolean("default").defaultTo(false);
    }),

    // users + users_data
    knex.schema.createTable(UM.USERS_TABLE, (table) => {
      table.increments("id").primary();
      table.string("uid", 100).unique().notNullable().index();
      table.string("email", 320).index();
      table.string("display_name").index();
      table.string("source", 10).index();
      table.string("status", 10).index();
      table.timestamps(true, true);
      table.integer("group_id").unsigned().index().references("id").inTable(UM.GROUPS_TABLE);
      table.integer("job_title_id").unsigned().index().references("id").inTable(UM.JOB_TITLES_TABLE);
    }),

    knex.schema.raw(`ALTER SEQUENCE ${UM.USERS_TABLE}_id_seq RESTART WITH 1000`), // PostgreSQL version

    // on update trigger
    knex.schema.raw(`
      CREATE OR REPLACE FUNCTION on_update_timestamp()
      RETURNS trigger AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `),
    knex.schema.raw(`
      CREATE TRIGGER ${UM.USERS_TABLE}_updated_at
      BEFORE UPDATE ON ${UM.USERS_TABLE}
      FOR EACH ROW
      EXECUTE PROCEDURE on_update_timestamp();
    `), // PostgreSQL version

    knex.schema.createTable(UM.USERS_DATA_TABLE, (table) => {
      table.integer("user_id").unsigned().notNullable().index().references("id").inTable(UM.USERS_TABLE).onDelete("CASCADE"); // prettier-ignore
      table.string("first_name_lat");
      table.string("last_name_lat");
      table.string("first_name_ru");
      table.string("second_name_ru");
      table.string("last_name_ru");
      table.string("photo");
      table.boolean("is_private_photo").defaultTo(true);
    }),

    // roles <-> users
    knex.schema.createTable(UM.ROLES2USERS_TABLE, (table) => {
      table.integer("role_id").unsigned().notNullable().index().references("id").inTable(UM.ROLES_TABLE).onDelete("CASCADE"); // prettier-ignore
      table.integer("user_id").unsigned().notNullable().index().references("id").inTable(UM.USERS_TABLE).onDelete("CASCADE"); // prettier-ignore
      table.unique(["role_id", "user_id"]);
    }),
    
    // photos
    knex.schema.createTable(UM.PHOTOS_TABLE, (table) => {
      table.increments("id").primary();
      table.integer("user_id").unsigned().notNullable().index().references("id").inTable(UM.USERS_TABLE).onDelete("CASCADE"); // prettier-ignore
      table.string("slug").notNullable().index();
      table.binary("data");
      table.string("filename");
      table.string("encoding");
      table.string("mime_type").notNullable();
      table.boolean("is_private_photo").defaultTo(true);
    }),
    
    // locks
    knex.schema.createTable(UM.LOCKS_TABLE, (table) => {
      table.string("user_uid", 100).notNullable().index().references("uid").inTable(UM.USERS_TABLE).onDelete("CASCADE"); // prettier-ignore
      table.string("object", 50).notNullable().index();
      table.integer("object_id").unsigned().notNullable().index();
      table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable().index();
      table.unique(["object", "object_id"]);
    }),
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return Promise.all(
    [
      UM.LOCKS_TABLE,
      UM.PHOTOS_TABLE,
      UM.ROLES2USERS_TABLE,
      UM.USERS_DATA_TABLE,
      UM.USERS_TABLE,
      UM.ROLES_TABLE,
      UM.GROUPS_TABLE,
      UM.JOB_TITLES_TABLE,
    ].map((tableName) => knex.schema.dropTableIfExists(tableName))
  );
};
