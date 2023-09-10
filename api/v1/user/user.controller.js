const bcrypt = require("bcryptjs");
const {
  updateUserProfile,
  updateUserPassword,
  updateUserSettingValidator,
  deleteUserValidator,
} = require("./user.validations");
const { responseHandler } = require("../../helpers");
const { User, UserSetting } = require("../../../model/schema").Schema;
const config = require("../../../config/environment");

const getStatus = async (req, res) => {
  try {
    return responseHandler(res, 200, true, "User found", {
      user: req.user,
    });
  } catch (error) {
    return responseHandler(res, 400, false, error.message);
  }
};

const updateUser = async (req, res) => {
  try {
    if (!req.user) {
      return responseHandler(res, 404, false, "User not found");
    }

    const { error, value } = updateUserProfile.validate(req.body);

    if (error) {
      return responseHandler(res, 400, false, error.message);
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { email: value.email, name: value.name } },
      { new: true }
    )
      .select("-password") // only password excluded
      .lean();

    return responseHandler(res, 200, true, "Profile updated successfully", {
      user: updatedUser,
    });
  } catch (error) {
    return responseHandler(res, 400, false, error.message);
  }
};

const updatePassword = async (req, res) => {
  try {
    const { error, value } = updateUserPassword.validate(req.body);

    if (error) {
      return responseHandler(res, 400, false, error.message);
    }

    // getting user just for the password that is saved in our db
    const user = await User.findOne({ _id: req.user._id })
      .select("password")
      .lean();

    // comparing password
    const _isMatched = await bcrypt.compare(
      value.currentPassword, // inBody
      user.password // db
    );

    if (!_isMatched) {
      return responseHandler(res, 404, false, "Incorrect current password");
    }

    const newPasswordHash = await bcrypt.hash(value.newPassword, 12);
    await User.updateOne(
      { _id: req.user._id },
      { $set: { password: newPasswordHash } }
    );

    return responseHandler(res, 200, true, "Updated password successfully", {
      user: req.user,
    });
  } catch (error) {
    return responseHandler(res, 400, false, error.message);
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    const payload = {
      Bucket: config.AWS.AWS_S3_BUCKET_NAME,
      Key: req.user._id.toString() + "-" + req.file.originalname,
      Body: req.file.buffer,
    };

    req.s3.upload(payload, async (err, response) => {
      if (err) {
        return responseHandler(res, 200, true, "Error uploading file", err);
      }

      await User.updateOne(
        { _id: req.user._id },
        { $set: { profileImage: response.Location } }
      );

      return responseHandler(res, 200, true, "File uploaded success", {
        url: response.Location,
        key: response.Key,
      });
    });
  } catch (error) {
    return responseHandler(res, 400, false, error.message);
  }
};

const deleteAccount = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id },
      { $set: { isScheduleForDeletion: true } }
    );

    return responseHandler(res, 200, true, "User deleted success");
  } catch (error) {
    return responseHandler(res, 400, false, error.message);
  }
};

const updateUserSetting = async (req, res) => {
  try {
    const { error, value } = updateUserSettingValidator.validate(req.body);

    if (error) {
      return responseHandler(res, 400, false, error.message);
    }

    await UserSetting.updateOne(
      { _id: req.user.userSetting._id.toString() },
      { $set: { ...value } }
    );

    return responseHandler(res, 200, true, "User setting updated successfully");
  } catch (error) {
    return responseHandler(res, 400, false, error.message);
  }
};

const deActivateAccount = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id },
      { $set: { isDeActivate: true } }
    );

    return responseHandler(res, 200, true, "User deactivated success");
  } catch (error) {
    return responseHandler(res, 400, false, error.message);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["USER", "ANALYST"] },
    })
      .select("role profileImage isVerified isDeActivate name email createdAt")
      .lean();
    return responseHandler(res, 200, true, "Users found success", users);
  } catch (error) {
    return responseHandler(res, 400, false, error.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { error, value } = deleteUserValidator.validate(req.body);

    if (error) {
      return responseHandler(res, 400, false, error.message);
    }

    const _deletedUsers = await User.deleteMany({
      _id: { $in: [...value.ids] },
    });

    return responseHandler(
      res,
      200,
      true,
      `${_deletedUsers.deletedCount} user(s) deleted success`
    );
  } catch (error) {
    return responseHandler(res, 400, false, error.message);
  }
};

module.exports = {
  getStatus,
  updateUser,
  updatePassword,
  uploadProfileImage,
  deleteAccount,
  deActivateAccount,
  updateUserSetting,
  getAllUsers,
  deleteUser,
};
