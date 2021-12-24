const express = require("express");
const router = express.Router();
const notificationsRoutes = require("./notifications.routes");
const logsRoutes = require("./logs.routes");

router.use("/notifications", notificationsRoutes);
router.use("/log", logsRoutes);

module.exports = router;
