import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { sequelize } from "./setupDB.mjs";
import userRoutes from "./routes/userRoutes.mjs"; // Importa las rutas
import fileRoutes from "./routes/FileRoutes.mjs"; // Importa las rutas
import cookieParser from "cookie-parser";

dotenv.config();

// config de express
const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // declarar el frontend en desarrollo
    credentials: true, // permitir las server side cookies
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
const port = process.env.SERVER_PORT || 3000;

// rutas de user
app.use("/user", userRoutes);
app.use("/backups",fileRoutes)

// rutas basicas
app.get("/", (req, res) => {
  res.send("Welcome to my server!");
});

// iniciar el server
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión con la base de datos establecida correctamente.");

    // await sequelize.sync({ force: true }); // force para crear las tablas
    await sequelize.sync(); // sincronizar base de datos
    console.log("Base de datos sincronizada.");
    
    app.listen(port, () => {
      console.log(`Servidor escuchando en http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error al inicializar la aplicación:", error);
  }
})();
