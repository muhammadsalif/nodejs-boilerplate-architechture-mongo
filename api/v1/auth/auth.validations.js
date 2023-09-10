const Joi = require("joi");

const signUpSchema = Joi.object().keys({
  name: Joi.string().required().error(new Error("name is required")),
  email: Joi.string().required().error(new Error("email is required")),
  password: Joi.string().required().error(new Error("password is required")),
  confirmPassword: Joi.string()
    .required()
    .error(new Error("confirm password is required")),
});

const loginSchema = Joi.object().keys({
  email: Joi.string().required().error(new Error("email is required")),
  password: Joi.string().required().error(new Error("password is required")),
  rememberMe: Joi.boolean().default(false).error(new Error("remember me key error")),
});

const forgetPasswordSchema = Joi.object().keys({
  email: Joi.string().required().error(new Error("email is required")),
});

const resetPasswordSchema = Joi.object().keys({
  id: Joi.string().required().error(new Error("id is required")),
  token: Joi.string().required().error(new Error("token is required")),
  password: Joi.string().required().error(new Error("password is required")),
  confirmPassword: Joi.string().required().error(new Error("confirm password is required")),
});

const Validators = (() => {
  const signUpValidation = signUpSchema;
  const loginValidation = loginSchema;
  const forgetPasswordValidation = forgetPasswordSchema;
  const resetPasswordValidation = resetPasswordSchema;

  return {
    signUpValidation,
    loginValidation,
    forgetPasswordValidation,
    resetPasswordValidation,
  };
})();

module.exports = Validators;
