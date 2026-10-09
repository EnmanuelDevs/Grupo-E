import mongoose from "mongoose";

const notificationLogSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["class-reminder", "daily-classes"],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("NotificationLog", notificationLogSchema);