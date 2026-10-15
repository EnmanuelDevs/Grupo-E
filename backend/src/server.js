import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";
import cron from "node-cron";
import { sendClassReminders } from "./jobs/classReminder.job.js";
import { sendTomorrowClasses } from "./jobs/dailyClasses.job.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const timezone = process.env.GYM_TIMEZONE || "America/La_Paz";

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

    cron.schedule(
      "0 16 * * *",
      async () => {
        try {
          await sendTomorrowClasses();
        } catch (error) {
          console.error("Error al enviar el resumen diario:", error.message);
        }
      },
      { timezone, noOverlap: true },
    );

    console.log("Revisión de recordatorios programada cada minuto");
    console.log(`Resumen diario: 16:00 (${timezone})`);
  })
  .catch((error) => {
    console.error("Error crítico conectando a MongoDB:", error);
    process.exit(1);
  }); 