const express = require("express");
const authController = require("./auth.controller");
const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.post("/forget-password", authController.forgetPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
