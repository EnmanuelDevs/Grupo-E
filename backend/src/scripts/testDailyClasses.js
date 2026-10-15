import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import { sendTomorrowClasses } from "../jobs/dailyClasses.job.js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Indica el correo de un miembro activo");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI);

  const member = await User.findOne({
    email,
    role: "member",
    active: true,
  });

  if (!member) {
    throw new Error("No existe un miembro activo con ese correo");
  }

  await sendTomorrowClasses({ onlyEmail: email });
  console.log("Prueba finalizada");
} catch (error) {
  console.error("Error en la prueba:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}