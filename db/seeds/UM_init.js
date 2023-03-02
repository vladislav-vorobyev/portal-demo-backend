/* eslint-disable func-names */

const UM = require("../UM_tables");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = function (knex) {
  return Promise.all([
    // roles
    knex(UM.ROLES_TABLE)
      .count()
      .first()
      .then((res) => {
        if (parseInt(res.count, 10) === 0) {
          console.log("- inserting default roles");
          // Insert default roles
          return knex(UM.ROLES_TABLE).insert([
            { slug: "admin", name: "Администратор" },
            { slug: "user", name: "Пользователь", default: true },
            { slug: "umadmin", name: "Управление базой сотрудников" },
          ]);
        }
        // Do nothing if not empty
        console.log(`- roles count: ${res.count}`);
        return Promise.resolve;
      }),

    // job_titles
    knex(UM.JOB_TITLES_TABLE)
      .count()
      .first()
      .then((res) => {
        if (parseInt(res.count, 10) === 0) {
          console.log("- inserting default job titles");
          // Insert default roles
          return knex(UM.JOB_TITLES_TABLE).insert([
            { slug: "director", name: "Директор" },
            { slug: "buhgalter", name: "Бухгалтер" },
            { slug: "v-engineer", name: "Ведущий инженер" },
            { slug: "s-engineer", name: "Старший инженер" },
            { slug: "m-engineer", name: "Младший инженер" },
          ]);
        }
        // Do nothing if not empty
        console.log(`- job titles count: ${res.count}`);
        return Promise.resolve;
      }),

    // groups
    knex(UM.GROUPS_TABLE)
      .count()
      .first()
      .then((res) => {
        if (parseInt(res.count, 10) === 0) {
          console.log("- inserting default groups");
          // Insert default roles
          return knex(UM.GROUPS_TABLE).insert([
            { slug: "kadrov", name: "Кадров" },
            { slug: "develop", name: "Разработки и дизайна" },
            { slug: "testing", name: "Тестирования" },
            { slug: "logistiki", name: "Логистики" },
            { slug: "hoz-obespecenia", name: "Хоз. обеспечения" },
            { slug: "proizvodstvo", name: "Производство" },
          ]);
        }
        // Do nothing if not empty
        console.log(`- groups count: ${res.count}`);
        return Promise.resolve;
      }),
  ]);
};
