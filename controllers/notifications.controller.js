const NotificationsService = require("../services/notifications.service");

class NotificationsController {
  getNotifications(req, res) {
    if (req.query.id) {
      let index;
      if (
        (index = req.notifications.findIndex(
          (item) => item.id == req.query.id
        )) >= 0
      ) {
        return res.status(200).send({ data: req.notifications[index] });
      } else {
        return res.status(404).send({ message: "Notification not found" });
      }
    } else if (req.notifications.length < 1) {
      return res.status(404).send({ message: "Notifications not found" });
    }

    return res.status(200).send({ data: req.notifications });
  }

  async createNotification(req, res) {
    if (req.body.notification) {
      let result = await NotificationsService.createNotification(
        req.body.notification
      );

      if (result) {
        return res.status(200).send(result);
      } else {
        return res.status(500).send({ message: "Unable create notification." });
      }
    } else {
      return res.status(400).send({ message: "Bad request." });
    }
  }

  async updateNotification(req, res) {
    if (req.body.notification && req.body.notification.id) {
      if (
        !req.notifications.find((item) => item.id == req.body.notification.id)
      ) {
        return res.status(404).send({ message: "Notification not found." });
      }

      let result = await NotificationsService.updateNotification(
        req.body.notification
      );

      if (result) {
        return res.status(200).send(result);
      } else {
        return res.status(500).send({ message: "Unable update notification." });
      }
    } else {
      return res.status(400).send({ message: "Bad request." });
    }
  }

  async deleteNotification(req, res) {
    if (req.query.id) {
      let index;
      if (
        (index = req.notifications.findIndex(
          (item) => item.id == req.query.id
        )) >= 0
      ) {
        let result = await NotificationsService.deleteNotification(
          req.query.id
        );

        if (result) {
          return res.status(200).send(result);
        } else {
          return res
            .status(500)
            .send({ message: "Unable delete notification." });
        }
      } else {
        return res.status(404).send({ message: "Notification not found." });
      }
    } else {
      return res.status(400).send({ message: "Bad request." });
    }
  }
}

module.exports = new NotificationsController();
