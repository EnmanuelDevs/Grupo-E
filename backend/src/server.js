import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";

dotenv.config();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Conexión a MongoDB exitosa");
        app.listen(PORT, () => {
            console.log(`Servidor ejecutándose en el puerto: ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error crítico conectando a MongoDB:", error);
        process.exit(1);
    });