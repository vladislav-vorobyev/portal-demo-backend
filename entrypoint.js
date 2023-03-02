const db = require("./db");

(async () => {
  try {
    console.log("Running migrations");
    await db.migrate.latest();

    console.log("Running seeds");
    await db.seed.run();

    // console.log("Running seeds");
    // await db.seed.run();

    console.log("Starting application");

    // eslint-disable-next-line global-require
    require("./index");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
