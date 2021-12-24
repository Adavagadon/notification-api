const LogsService = require("../services/logs.service");

class LogsController {
  getLogs(req, res) {
    return res.status(200).send({ data: req.logs });
  }
}

module.exports = new LogsController();
