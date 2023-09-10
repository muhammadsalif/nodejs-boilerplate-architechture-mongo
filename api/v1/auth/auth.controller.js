const jwt = require("jsonwebtoken");
const { User } = require("../../../model/schema").Schema;
const bcrypt = require("bcryptjs");
const config = require("../../../config/environment/index");
const authService = require("./auth.service");
const { promisify } = require("util");

const {
  signUpValidation,
  loginValidation,
  forgetPasswordValidation,
  resetPasswordValidation,
} = require("./auth.validations");
const { responseHandler } = require("../../helpers");

const signUp = async (req, res) => {
  try {
    const { error, value } = signUpValidation.validate(req.body);

    if (error) {
      return responseHandler(res, 400, false, error.message);
    }

    const _user = await User.findOne({ email: value.email })
      .select("email")
      .lean();

    if (_user) {
      return responseHandler(res, 400, false, "Email already exists");
    }

    const user = {
      name: value.name,
      email: value.email,
      password: value.password,
      confirmPassword: value.confirmPassword,
    };
    // hashing
    user.password = await bcrypt.hash(value.password, 12);

    return responseHandler(res, 200, true, "Signup successfully");
  } catch (error) {
    return responseHandler(res, 400, false, error.message);
  }
};

const login = async (req, res) => {
  try {
    const { error, value } = loginValidation.validate(req.body);

    if (error) {
      return responseHandler(res, 400, false, error.message);
    }

    const user = await User.findOne({ email: value.email })
      .select(
        "email password role isVerified name isScheduleForDeletion isDeActivate"
      )
      .lean();

    if (!user) {
      return responseHandler(res, 404, false, "User not found");
    }

    if (user.isScheduleForDeletion) {
      return responseHandler(res, 400, false, "User is deleted");
    }

    // comparing password
    const _isMatched = await bcrypt.compare(value.password, user.password);

    if (!_isMatched) {
      return responseHandler(res, 404, false, "Incorrect Email or password");
    }

    let token;
    if (value.rememberMe) {
      token = jwt.sign({ id: user._id }, config.JWT.SECRET, {
        expiresIn: config.JWT.REMEMBER_ME_EXPIRES_IN,
      });
    } else {
      token = jwt.sign({ id: user._id }, config.JWT.SECRET, {
        expiresIn: config.JWT.EXPIRES_IN,
      });
    }

    if (user.isDeActivate) {
      await User.updateOne(
        { _id: user._id },
        { $set: { isDeActivate: false } }
      );
    }

    return responseHandler(
      res,
      200,
      true,
      user.isDeActivate ? "Welcome back!" : "Login Successfully",
      {
        token,
        user,
      }
    );
  } catch (error) {
    return responseHandler(res, 400, false, error.message);
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { error, value } = forgetPasswordValidation.validate(req.body);

    if (error) {
      return responseHandler(res, 400, false, error.message);
    }

    const _user = await User.findOne({ email: value.email }).lean();
    if (!_user) {
      return responseHandler(res, 404, false, "User not found");
    }

    await authService._generateEmailWithMagicLink(_user);

    return responseHandler(
      res,
      200,
      true,
      "Password reset link has been sent to your email."
    );
  } catch (error) {
    return responseHandler(res, 400, false, error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { error, value } = resetPasswordValidation.validate({
      ...req.query,
      ...req.body,
    });

    if (error) {
      return responseHandler(res, 400, false, error.message);
    }

    const _user = await User.findOne({ _id: value.id }).lean();
    if (!_user) {
      return responseHandler(res, 400, false, "User not found");
    }

    const secret = config.JWT.SECRET + _user.password;

    try {
      await promisify(jwt.verify)(value.token, secret);
    } catch (err) {
      // issue with magic link token
      return responseHandler(res, 400, false, "Link invalid");
    }

    const _newPasswordHash = await bcrypt.hash(value.password, 12);

    await User.updateOne(
      { _id: value.id },
      { $set: { password: _newPasswordHash } }
    );

    return responseHandler(res, 200, true, "Password reset successfully");
  } catch (error) {
    return responseHandler(res, 400, false, error.message);
  }
};

module.exports = {
  signUp,
  login,
  forgetPassword,
  resetPassword,
};
