require("dotenv").config();

/**
 * @type { import("knex").Knex.Config }
 */

module.exports = {
  client: "pg",
  connection: {
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
  },
  searchPath: [process.env.DATABASE_NAME, "public"],
  migrations: {
    tableName: "knex_migrations",
    directory: "./db/migrations",
  },
  seeds: {
    tableName: "knex_seeds",
    directory: "./db/seeds",
  },
};
