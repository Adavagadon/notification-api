const { Sequelize, DataTypes } = require("sequelize");
const TaskRunner = require("./taskrunner");
const nodemailer = require("nodemailer");
const Logger = require("./logger");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    dialect: "postgres",
    host: process.env.DB_HOST,
  }
);

const Notification = sequelize.define("notification", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  type: {
    type: Sequelize.STRING(10),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
  },
  time: {
    type: DataTypes.TIME,
  },
  customDates: {
    type: Sequelize.STRING,
  },
  expireDate: {
    type: DataTypes.DATEONLY,
  },
  name: {
    type: Sequelize.STRING(25),
    allowNull: false,
  },
  text: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  recievers: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

sequelize
  .sync()
  .then((resp) => {
    console.log("Synced");
  })
  .catch((err) => console.log(err));

class NotificationsService {
  async getNotifications() {
    let result = await Notification.findAll();

    if (result) {
      return result.map((item) => item.toJSON());
    } else {
      return false;
    }
  }

  async createNotification(data) {
    let result = await Notification.create(data);

    if (!result) {
      Logger.writeLog({
        date: new Date(),
        type: "Error",
        text: "Unable create row in DB",
      });
      return false;
    }

    data.id = result.id;

    result = TaskRunner.createTasks(data);

    if (result) {
      Logger.writeLog({
        date: new Date(),
        type: "Complete",
        text: "Notification created.",
      });
      return { message: "Notification created." };
    } else {
      Logger.writeLog({
        date: new Date(),
        type: "Error",
        text: "Unable create task.",
      });
      return false;
    }
  }

  async updateNotification(data) {
    let result = await Notification.update(data, { where: { id: data.id } });

    if (!result) {
      Logger.writeLog({
        date: new Date(),
        type: "Error",
        text: "Unable update row in DB",
      });
      return false;
    }

    result = TaskRunner.updateTasks(data);

    if (result) {
      Logger.writeLog({
        date: new Date(),
        type: "Complete",
        text: "Notification updated.",
      });
      return { message: "Notification updated." };
    } else {
      Logger.writeLog({
        date: new Date(),
        type: "Error",
        text: "Unable update task.",
      });
      return false;
    }
  }

  async deleteNotification(data) {
    let result = await Notification.destroy({ where: { id: data } });

    if (!result) {
      Logger.writeLog({
        date: new Date(),
        type: "Error",
        text: "Unable delete row in DB.",
      });
      return false;
    }

    result = TaskRunner.deleteTask(data);

    if (result) {
      Logger.writeLog({
        date: new Date(),
        type: "Complete",
        text: "Notification deleted.",
      });
      return { message: "Notification deleted." };
    } else {
      Logger.writeLog({
        date: new Date(),
        type: "Error",
        text: "Unable delete task.",
      });
      return false;
    }
  }

  async deleteAllNotifications() {
    let result = await Notification.destroy({ truncate: true });

    result = TaskRunner.deleteAllTasks();

    if (result) {
      Logger.writeLog({
        date: new Date(),
        type: "Complete",
        text: "All notifications deleted.",
      });
      return { message: "Notifications deleted." };
    } else {
      Logger.writeLog({
        date: new Date(),
        type: "Error",
        text: "Unable delete all notifications.",
      });
      return false;
    }
  }

  async restartNotifications() {
    let data = await this.getNotifications();

    if (data) {
      for (let item of data) {
        let result = TaskRunner.createTasks(item);

        if (!result) {
          Logger.writeLog({
            date: new Date(),
            type: "Error",
            text: "Unable start Task.",
          });
          console.log("Unable start Task.");
        } else {
          Logger.writeLog({
            date: new Date(),
            type: "Complete",
            text: "Task started.",
          });
          console.log("Task started.");
        }
      }
    } else {
      Logger.writeLog({
        date: new Date(),
        type: "Info",
        text: "No tasks to run.",
      });
      console.log("No tasks to run.");
    }
  }

  async sendInstant(data) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EM_ADRS,
        pass: process.env.EM_PASS,
      },
    });

    try {
      let result = await transporter.sendMail({
        from: `"Notification API" <${process.env.EM_ADRS}>`,
        to: data.recievers,
        subject: data.name,
        text: data.text,
      });

      if (!result) {
        Logger.writeLog({
          date: new Date(),
          type: "Error",
          text: "Unable sent an instant notification.",
        });
        return false;
      }

      Logger.writeLog({
        date: new Date(),
        type: "Complete",
        text: "Instant sent.",
      });
      return { message: "Instant sent." };
    } catch (err) {
      console.log(err);
      Logger.writeLog({
        date: new Date(),
        type: "Error",
        text: "Unable sent an instant notification.",
      });
      return false;
    }
  }
}

module.exports = new NotificationsService();
