const express = require("express");
const router = express.Router();
const LogsController = require("../controllers/logs.controller");
const LogsService = require("../services/logs.service");

router.use(async (req, res, next) => {
  let data = await LogsService.getLogs();

  if (data) {
    req.logs = data;
    next();
  } else {
    return res.status(500).send({ message: "Error while getting logs" });
  }
});

router.route("/").get(LogsController.getLogs);

module.exports = router;
