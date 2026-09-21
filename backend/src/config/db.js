import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB conectado: ${connection.connection.host}`);
  } catch (error) {
    console.error("Error conectando a MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;