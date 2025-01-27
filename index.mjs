import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import path from "path";
import { sequelize } from "./setupDB.mjs";
import userRoutes from "./routes/userRoutes.mjs";
import recipesRoutes from "./routes/RecetasRoutes.mjs";
import cookieParser from "cookie-parser";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
app.use("/images", express.static(path.join(__dirname, "uploads")));

app.get("/",async (req,res) => {
  res.json("hola desde el server")
})

// Ejemplo de endpoint para manejar imágenes específicas
app.get("/images/:filename", (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, "uploads", filename);
  res.sendFile(filepath);
});
const port = process.env.SERVER_PORT || 3000;

// rutas de user
app.use("/user", userRoutes);
app.use("/recipe", recipesRoutes);

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
