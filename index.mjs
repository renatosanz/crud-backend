import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cors from "cors";
import { sequelize } from "./setupDB.mjs";
import userRoutes from "./routes/userRoutes.mjs"; // Importa las rutas
import { User } from "./models/User.mjs";
import bcrypt from "bcryptjs";

dotenv.config();

// config de express
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.SERVER_PORT || 3000;

// rutas de user
app.use("/user", userRoutes);

// rutas basicas
app.get("/", (req, res) => {
  res.send("Welcome to my server!");
});
// LOGIN de la app
app.post("/login", async (req, res) => {
  try {
    let body = req.body;

    // busca la usuario en la db
    let usuarioDB = await User.findOne({ where: { email: body.email } });
    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "Usuario o contraseña incorrectos",
        },
      });
    }

    // valida que la contraseña escrita por el usuario, sea la almacenada en la db
    if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "Usuario o contraseña incorrectos",
        },
      });
    } else {
      // Remover info inecesaria, esta info solo se obtendra mediante llamadas ala api autenticadas
      delete usuarioDB.dataValues?.password;
      delete usuarioDB.dataValues?.balance;
      delete usuarioDB.dataValues?.createdAt;
      delete usuarioDB.dataValues?.updatedAt;
    }

    let token = jwt.sign(
      {
        user: usuarioDB,
      },
      process.env.SEED_AUTENTICACION,
      {
        expiresIn: process.env.CADUCIDAD_TOKEN,
      }
    );
    res.json({
      ok: true,
      token,
    });
  } catch (error) {
    console.error("Error al logear usuario:", error);
    res.status(500).json({ error: "No se pudo logear el usuario." });
  }
});

// iniciar el server
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión con la base de datos establecida correctamente.");

    //await sequelize.sync({force:true}); // force para crear las tablas
    await sequelize.sync(); // sincronizar base de datos
    console.log("Base de datos sincronizada.");

    app.listen(port, () => {
      console.log(`Servidor escuchando en http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error al inicializar la aplicación:", error);
  }
})();
