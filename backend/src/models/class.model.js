import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: String, required: true },
    capacity: { type: Number, required: true },
    availableSpots: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model("Class", classSchema);