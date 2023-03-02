const knex = require("../db");

const get = async (userId) => {
  const result = await knex("dashboards")
    .first("dashboard")
    .where("user_id", userId);

  return result?.dashboard;
};

const set = (userId, dashboard) =>
  knex("dashboards")
    .insert({
      user_id: userId,
      dashboard: JSON.stringify(dashboard),
      updated_at: knex.fn.now(),
    })
    .onConflict("user_id")
    .merge(["dashboard", "updated_at"])
    // https://github.com/knex/knex/issues/5257
    .clear("where");

module.exports = { get, set };
