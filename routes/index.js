const express = require("express");
const router = express.Router();
const notificationsRoutes = require("./notifications.routes");

router.use("/notifications", notificationsRoutes);

module.exports = router;
