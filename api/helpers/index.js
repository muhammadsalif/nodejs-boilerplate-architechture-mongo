const { Plan, Subscription, UserSetting } =
  require("../../model/schema").Schema;

const Utility = (() => {
  const responseHandler = (res, code = 500, status, message, data = null) => {
    result = status ? "Success" : "Failed";
    const json = { status, result, message };

    if (data) {
      json.data = data;
    }

    return res.status(code).json(json);
  };

  const createUserSubscription = async (state, userId) => {
    // for now finding with state and subcribing to it
    // but we can break it to single zipCode as well
    const plansIds = await Plan.find({ state: state }).distinct("_id");

    const subscription = {
      userId,
      plans: plansIds,
      isCancelled: false,
      price: 100,
      lastPaymentPrice: 100,
      billingStartDate: new Date(),
    };

    await Subscription.create(subscription);

    return Promise.resolve();
  };

  const createUserSettings = async (userId) => {
    const userSettings = {
      userId,
    };
    const settings = await UserSetting.create(userSettings);
    return Promise.resolve(settings);
  };

  return {
    responseHandler,
    createUserSettings,
    createUserSubscription,
  };
})();

module.exports = Utility;
