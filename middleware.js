const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const config = require("./config/environment/index");
const { responseHandler, createUserSettings } = require("./api/helpers/index");
const { User, Subscription, UserSetting, Plan } =
  require("./model/schema").Schema;

const middleware = (() => {
  //To Check whether user is login or not
  async function validateUser(req, res, next) {
    //1 getting Token and check if there
    let token;
    if (
      req.headers &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return responseHandler(res, 401, false, "You are not logged in");
    }
    //verifying Token

    let decoded;
    try {
      // remove promisify if needed
      decoded = await promisify(jwt.verify)(token, config.JWT.SECRET);
    } catch (err) {
      // issue with token
      return responseHandler(res, 400, false, "token invalid");
    }

    //checking User Really Exist
    const user = await User.findById(decoded.id)
      .select("name email profileImage role")
      .lean();

    if (!user) {
      return responseHandler(
        res,
        401,
        false,
        "The User Belonging to this Token does no longer Exist"
      );
    }
    req.user = user;
    next(); //Allowing Access to
  }
  async function validateAnalyst(req, res, next) {
    if (req.user.role !== "ANALYST") {
      return responseHandler(res, 400, false, "Permissions denied");
    }
    next();
  }
  async function validateAdmin(req, res, next) {
    if (req.user.role !== "ADMIN") {
      return responseHandler(res, 400, false, "Permissions denied");
    }
    next();
  }

  async function attachUserSubscription(req, res, next) {
    let userSubscription = await Subscription.findOne({
      userId: req.user._id,
    })
      .select("userId plans")
      .lean();

    req.user.subscription = userSubscription;
    next();
  }

  async function attachUserSettings(req, res, next) {
    let userSetting = await UserSetting.findOne({
      userId: req.user._id.toString(),
    })
      .select("color fixed mini theme type")
      .lean();

    if (!userSetting) {
      const { _id, color, fixed, mini, theme, type } = await createUserSettings(
        req.user._id.toString()
      );
      userSetting = { _id, color, fixed, mini, theme, type };
    }
    req.user.userSetting = userSetting;
    next();
  }

  return {
    validateUser,
    validateAnalyst,
    validateAdmin,
    attachUserSubscription,
    attachUserSettings,
  };
})();
module.exports = middleware;
