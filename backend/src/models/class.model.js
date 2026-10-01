import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "La capacidad debe ser un número entero.",
      },
    },
    availableSpots: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Class", classSchema);
