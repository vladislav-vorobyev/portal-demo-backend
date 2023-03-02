const express = require("express");
const auth = require("../utils/auth");
const dashboards = require("../services/dashboards");

const router = express.Router();

router.get("/me/dashboard", auth.check, async (req, res) => {
  const id = auth.UID(req);
  const dashboard = await dashboards.get(id);

  return res.status(200).send(dashboard);
});

router.put("/me/dashboard", auth.check, async (req, res) => {
  const id = auth.UID(req);
  const dashboard = req.body;

  await dashboards.set(id, dashboard);

  return res.sendStatus(204);
});

module.exports = router;
