import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

console.log(
  "MONGO_URI cargada:",
  process.env.MONGO_URI ? "Sí" : "No"
);

const PORT = process.env.PORT || 3000;

connectDB().then(()=> {
app.listen(PORT, () => {
    console.log(`Servior ejecutandose en el puerto: ${PORT}`);
});
});