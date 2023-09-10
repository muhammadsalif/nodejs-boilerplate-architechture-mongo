const express = require("express");
const userController = require("./user.controller");

const middleware = require("../../../middleware");

const router = express.Router();

router.use(middleware.validateUser);
router.get("/users", middleware.validateAdmin, userController.getAllUsers);
router.get(
  "/status",
  middleware.attachUserSubscription,
  middleware.attachUserSettings,
  userController.getStatus
);
router.patch("/update-user", userController.updateUser);
router.patch("/update-password", userController.updatePassword);
router.put(
  "/update-user-setting",
  middleware.attachUserSettings,
  userController.updateUserSetting
);
router.delete(
  "/delete-user",
  middleware.validateAdmin,
  userController.deleteUser
);
router.put("/delete-account", userController.deleteAccount);
router.put("/deactivate-account", userController.deActivateAccount);

module.exports = router;
