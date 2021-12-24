const nodemailer = require("nodemailer");
const cron = require("node-cron");

class TaskRunner {
  constructor() {
    this.tasks = {};
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EM_ADRS,
        pass: process.env.EM_PASS,
      },
    });
    this.sendMail = (mailData) => {
      let attempt = 0;
      this.transporter.sendMail(mailData, (err, info) => {
        if (err) {
          console.log(err);
          if (attempt < 3) {
            setTimeout(
              this.sendMail(mailData),
              attempt == 0
                ? 60000
                : attempt == 1
                ? 300000
                : attempt == 2
                ? 600000
                : null
            );
            attempt++;
          } else {
            console.log("Status: ошибка при отправке.");
          }
        } else {
          console.log("Message sent: %s", info.messageId);
        }
      });
    };
  }

  createTasks(data) {
    if (data.type == "one-time") {
      const date = new Date(`${data.date} ${data.time}`);
      const expression = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${
        date.getMonth() + 1
      } *`;

      let task = cron.schedule(expression, () => {
        const mailData = {
          from: `"Notification API" <${process.env.EM_ADRS}>`,
          to: data.recievers,
          subject: data.name,
          text: data.text,
        };
        this.sendMail(mailData);
      });

      if (!task) {
        console.log("Unable create task.");
        return false;
      }

      this.tasks[data.id] = task;

      return { message: "Task created." };
    } else if (data.type == "daily") {
      const date = data.time.split(":");
      const expression = `${date[1]} ${date[0]} * * *`;

      let task = cron.schedule(expression, () => {
        const mailData = {
          from: `"Notification API" <${process.env.EM_ADRS}>`,
          to: data.recievers,
          subject: data.name,
          text: data.text,
        };
        this.sendMail(mailData);
      });

      if (!task) {
        console.log("Unable create task.");
        return false;
      }

      this.tasks[data.id] = task;

      return { message: "Task created." };
    } else if (data.type == "custom") {
      const dates = data.customDates.split(",").map((item) => item.trim());
      const tasks = [];
      for (let date of dates) {
        const time = date.match(/\d\d:\d\d/).split(":");
        const dayOfTheWeek = date.replace(time, "").trim();
        const expression = `${time[1]} ${time[0]} * * ${dayOfTheWeek}`;

        let task = cron.schedule(expression, () => {
          const mailData = {
            from: `"Notification API" <${process.env.EM_ADRS}>`,
            to: data.recievers,
            subject: data.name,
            text: data.text,
          };
          this.sendMail(mailData);
        });

        tasks.push(task);
      }

      if (!task) {
        console.log("Unable create task.");
        return false;
      }

      this.tasks[data.id] = tasks;

      return { message: "Tasks created." };
    }
  }

  updateTasks(data) {
    if (this.tasks.hasOwnProperty(data.id)) {
      if (Array.isArray(this.tasks[data.id])) {
        for (let task of this.tasks[data.id]) {
          task.stop();
        }
      } else {
        this.tasks[data.id].stop();
      }
    } else {
      console.log("Task(s) not found.");
      return false;
    }

    delete this.tasks[data.id];

    const result = this.createTasks(data);

    if (result) {
      return { message: "Task(s) updated." };
    } else {
      console.log("Unable update task(s).");
      return false;
    }
  }

  deleteTask(id) {
    if (this.tasks.hasOwnProperty(id)) {
      if (Array.isArray(this.tasks[id])) {
        for (let task of this.tasks[id]) {
          task.stop();
        }
      } else {
        this.tasks[id].stop();
      }
    } else {
      console.log("Task(s) not found.");
      return false;
    }

    delete this.tasks[id];

    return { message: "Task(s) deleted." };
  }

  deleteAllTasks() {
    for (let item in this.tasks) {
      if (Array.isArray(this.tasks[item])) {
        for (let task of item) {
          task.stop();
        }
      } else {
        this.tasks[item].stop();
      }
    }

    this.tasks = {};

    return { message: "Tasks deleted." };
  }
}

module.exports = new TaskRunner();
