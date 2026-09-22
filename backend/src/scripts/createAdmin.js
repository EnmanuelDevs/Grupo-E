import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config({ path: "./.env" });

const createAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({
      email: "admin@dynamiczone.com"
    });

    if (existingAdmin) {
      console.log("El administrador ya existe");
      process.exit(0);
    }

//esto sirve para encriptar la contraseña del administrador y crear el usuario administrador en la base de datos.       
    const hashedPassword = await bcrypt.hash(
      "Admin123",
      10
    );

    const admin = await User.create({
      name: "Administrador Gym",
      lastName: "Gym",
      email: "admin@dynamiczone.com",
      password: hashedPassword,
      role: "admin",
      active: true
    });

    console.log("Administrador creado correctamente");
    console.log(`Nombre: ${admin.name}`);
    console.log(`Apellido: ${admin.lastName}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Rol: ${admin.role}`);

    process.exit(0);

  } catch (error) {
    console.error(
      "Error creando administrador:",
      error.message
    );

    process.exit(1);
  }
};

createAdmin();