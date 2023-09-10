const Joi = require("joi");

const mongooseId = Joi.string()
  .hex()
  .lowercase()
  .trim()
  .length(24)
  .error(new Error("Invalid mongoose id"));

const updateProfile = Joi.object().keys({
  name: Joi.string().optional().error(new Error("name invalid")),
  email: Joi.string().optional().error(new Error("email invalid")),
  password: Joi.string().optional().error(new Error("password invalid")),
  confirmPassword: Joi.string()
    .optional()
    .error(new Error("confirm password invalid")),
  profileImage: Joi.string()
    .optional()
    .error(new Error("profile image link invalid")),
});

const updatePassword = Joi.object().keys({
  currentPassword: Joi.string()
    .required()
    .error(new Error("Current password is required")),
  newPassword: Joi.string()
    .required()
    .error(new Error("New password is required")),
  confirmPassword: Joi.string()
    .required()
    .error(new Error("Confirm password is required")),
});

const updateSetting = Joi.object().keys({
  color: Joi.string().optional().error(new Error("color error")),
  type: Joi.string().optional().error(new Error("type error")),
  fixed: Joi.boolean().optional().error(new Error("fixed error")),
  mini: Joi.boolean().optional().error(new Error("mini error")),
  theme: Joi.boolean().optional().error(new Error("theme error")),
});

const deleteUser = Joi.object().keys({
  ids: Joi.array()
    .items(mongooseId)
    .required()
    .error(new Error("invalid user ids")),
});

const Validators = (() => {
  const updateUserProfile = updateProfile;
  const updateUserPassword = updatePassword;
  const updateUserSettingValidator = updateSetting;
  const deleteUserValidator = deleteUser;

  return {
    updateUserProfile,
    updateUserPassword,
    updateUserSettingValidator,
    deleteUserValidator,
  };
})();

module.exports = Validators;
