import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config(); // Cargar variables de entorno

// Crear instancia de Sequelize
export const sequelize = new Sequelize(
  process.env.NAME_DB,
  process.env.USR_DB,
  process.env.PSW_DB,
  {
    host: process.env.HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false, // Desactiva el logging (útil en producción)
    pool: {
      max: 5, // Máximo de conexiones simultáneas
      min: 0, // Mínimo de conexiones en el pool
      acquire: 30000, // Tiempo máximo para obtener conexión (ms)
      idle: 10000, // Tiempo antes de liberar una conexión inactiva (ms)
    },
  }
);

// Probar conexión con la base de datos
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión con la base de datos establecida correctamente.");
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error.message);
  }
})();
