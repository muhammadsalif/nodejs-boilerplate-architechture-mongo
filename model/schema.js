/* eslint-disable */

"use strict";

const mongoose = require("mongoose");
const db = require("../db");
const { Schema } = mongoose;
const { Types } = Schema;

const UserSchema = new Schema(
  {
    email: {
      type: Types.String,
    },
    password: {
      type: Types.String,
    },
    confirmPassword: {
      type: Types.String,
    },
    role: {
      type: String,
      enum: ["ADMIN", "ANALYST", "USER"],
      default: "USER",
    },
    name: {
      type: Types.String,
    },
    profileImage: {
      type: Types.String,
      default: "",
    },
    isVerified: {
      type: Types.Boolean,
      default: false,
    },
    isScheduleForDeletion: {
      type: Types.Boolean,
      default: false,
    },
    isDeActivate: {
      type: Types.Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const UserSettingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    color: {
      type: Types.String,
      enum: ["primary", "dark", "info", "success", "warning", "error"],
      default: "primary",
    },
    type: {
      type: Types.String,
      enum: ["dark", "transparent", "white"],
      default: "dark",
    },
    fixed: {
      type: Types.Boolean,
      default: true,
    },
    mini: {
      type: Types.Boolean,
      default: false,
    },
    theme: {
      type: Types.Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const PlanSchema = new Schema(
  {
    // name: {
    //   type: Types.String,
    //   default: "BASIC",
    //   required: true,
    //   enum: ["BASIC", "STANDARD", "PREMIUM"],
    // },
    state: {
      type: Types.String,
      required: true,
    },
    county: {
      type: Types.String,
      required: true,
    },
    city: {
      type: Types.String,
      required: true,
    },
    zipCode: {
      type: Types.String,
      required: true,
    },
    // displayName: {
    //   type: Types.String,
    // },
    metadata: {
      type: Types.Mixed,
      default: {},
    },
    priority: Number,
  },
  { timestamps: true }
);

const SubscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    plans: [{ type: Schema.Types.ObjectId, ref: "Plan" }],
    isCancelled: { type: Boolean, default: false },
    price: Number,
    lastPaymentPrice: Number,
    billingStartDate: { type: Date, default: Date.now },
    billingEndDate: Date,
    cancelledDate: Date,
  },
  { timestamps: true, usePushEach: true }
);

PlanSchema.index({ userId: 1, name: 1 });

let Schemas = [
  { name: "User", schema: UserSchema },
  { name: "UserSetting", schema: UserSettingSchema },
  { name: "Plan", schema: PlanSchema },
  { name: "Subscription", schema: SubscriptionSchema },
];

const onDataRemove = function (type, data) {
  let deleteRecordModel = db.model("DeleteRecord");
  let deleteRecord = new deleteRecordModel();
  deleteRecord.type = type;
  deleteRecord.data = data;
  deleteRecord.save();
};

let models = {};
Schemas.forEach(function (data) {
  if (data.onDelete) {
    data["schema"].post("remove", function (model) {
      onDataRemove(data.onDelete, model.toJSON());
    });
  }
  if (data.collectionName) {
    models[data.name] = db.model(data.name, data.schema, data.collectionName);
  } else {
    models[data.name] = db.model(data.name, data.schema);
  }
});

module.exports.mongoose = db;
module.exports.Schema = models;
