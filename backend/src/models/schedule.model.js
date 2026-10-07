import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "El ID de la clase es obligatorio"],
    },
    date: {
      type: String,
      required: [true, "La fecha es obligatoria"],
    },
    time: {
      type: String,
      required: [true, "La hora es obligatoria"],
    },

    availableSpots: {
      type: Number,
      default: 0,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Schedule", scheduleSchema);
