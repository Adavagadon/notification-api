const { Sequelize, DataTypes } = require("sequelize");

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
    console.log(data);
    let result = await Notification.create(data);

    if (result) {
      return { message: "Notification created." };
    } else {
      return false;
    }
  }

  async updateNotification(data) {
    let result = await Notification.update(data, { where: { id: data.id } });

    if (result) {
      return { message: "Notification updated." };
    } else {
      return false;
    }
  }

  async deleteNotification(data) {
    let result = await Notification.destroy({ where: { id: data } });

    if (result) {
      return { message: "Notification deleted." };
    } else {
      return false;
    }
  }
}

module.exports = new NotificationsService();
