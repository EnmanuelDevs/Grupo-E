import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";
import cron from "node-cron";
import { sendClassReminders } from "./jobs/classReminder.job.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Conexión a MongoDB exitosa");

    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en el puerto: ${PORT}`);
    });

    cron.schedule(
      "* * * * *",
      async () => {
        try {
          await sendClassReminders();
        } catch (error) {
          console.error("Error al revisar recordatorios:", error.message);
        }
      },
      {
        timezone: process.env.GYM_TIMEZONE || "America/La_Paz",
        noOverlap: true,
      },
    );

    console.log("Revisión de recordatorios programada cada minuto");
  })
  .catch((error) => {
    console.error("Error crítico conectando a MongoDB:", error);
    process.exit(1);
  });