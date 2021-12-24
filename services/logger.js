const fs = require("fs");

const logPath = "./logs/log.txt";

if (
  fs.readFile(logPath, "utf8", (err, data) => {
    if (err && err.errno == -4058) {
      fs.writeFile(logPath, "", (err) => {
        console.log(err);
      });
    }
  })
);

class Logger {
  async readLogs() {
    return await fs.promises.readFile(logPath, "utf8");
  }

  writeLog(data) {
    fs.readFile(logPath, "utf8", (err, fileData) => {
      if (err) {
        console.log(err);
      } else {
        fileData += `\n${data.date}|${data.type}: ${data.text}`;

        fs.writeFile(logPath, fileData, (err) => {
          if (err) {
            console.error(err);
          } else {
            console.log("Log saved");
          }
        });
      }
    });
  }
}

module.exports = new Logger();
