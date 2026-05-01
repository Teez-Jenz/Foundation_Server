const express = require("express");
const router = express.Router();
const controller = require("../controller/userController");

router.get("/me", controller.welcome);
router.get("/subscribed-users", controller.allSubscribers);
router.post("/subscribeUser", controller.subscribeUser);
router.post("/register-admin", controller.registerAdmin);
router.post("/admin-login", controller.adminLogin);

module.exports = router;
