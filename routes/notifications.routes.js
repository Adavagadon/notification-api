const express = require("express");
const router = express.Router();
const NotificationsController = require("../controllers/notifications.controller");
const NotificationsService = require("../services/notifications.service");

router.use(async (req, res, next) => {
  let data = await NotificationsService.getNotifications();

  if (data) {
    req.notifications = data;
    next();
  } else {
    return res
      .status(500)
      .send({ message: "Error while getting notifications" });
  }
});

router
  .route("/")
  .get(NotificationsController.getNotifications)
  .post(NotificationsController.createNotification)
  .put(NotificationsController.updateNotification)
  .delete(NotificationsController.deleteNotification);

router.route("/instant").post(NotificationsController.sendInstant);

module.exports = router;
