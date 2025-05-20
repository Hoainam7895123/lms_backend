const { Schema, model, Types } = require("mongoose");
const SchemaObject = new Schema(
  {
    user_id: {
      type: Types.ObjectId,
      ref: "users",
      required: true,
    },
    refresh_token: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = model("refresh_tokens", SchemaObject);
