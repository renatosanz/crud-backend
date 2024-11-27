import express from "express";
import { User } from "../models/User.mjs";

const router = express.Router();

// registrar un usuario
router.post("/", async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res
      .status(201)
      .json({ message: "Usuario registrado exitosamente.", user: newUser });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ error: "No se pudo registrar el usuario." });
  }
});

export default router;
