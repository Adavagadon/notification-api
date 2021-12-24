const Logger = require("./logger");

class LogsService {
  async getLogs() {
    let result = await Logger.readLogs();

    console.log(result);

    if (result) {
      return result;
    } else {
      return false;
    }
  }
}

module.exports = new LogsService();
