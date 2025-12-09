const express = require("express");
const router = express.Router();
const controller = require("../controller/userController");

router.get("/me", controller.welcome);
router.get("/subscribed-user", controller.allSubscribers);
router.post("/subscribe", controller.subscribe);
router.post("/register-admin", controller.registerAdmin);
router.post("/admin-login", controller.adminLogin);

module.exports = router;
