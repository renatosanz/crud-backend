import express from "express";
import { User } from "../models/User.mjs";
import bcrypt from "bcryptjs";

const router = express.Router();

// registrar un usuario
router.post("/", async (req, res) => {
  try {
    let userDataHashedPwd = req.body;
    bcrypt.genSalt(10, function (err, salt) {
      // generar un salt
      bcrypt.hash(req.body.password, salt, async (err, hash) => {
        // hashear el password
        userDataHashedPwd.password = hash;
        const newUser = await User.create(userDataHashedPwd);
        res
          .status(201)
          .json({ message: "Usuario registrado exitosamente.", user: newUser });
      });
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ error: "No se pudo registrar el usuario." });
  }
});

export default router;
