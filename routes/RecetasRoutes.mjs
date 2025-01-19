import express from "express";
import { Receta } from "../models/Recetas.mjs";
import multer from "multer";
import jwt from "jsonwebtoken";

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },

  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".jpg");
  },
});

var upload = multer({ storage: storage });

const router = express.Router();

router.post("/upload", upload.single("image"), async (req, res) => {
  console.log(req.file, req.body);
  let recipe_data = req.body;
  try {
    await Receta.create({
      id: crypto.randomUUID(),
      user_id: recipe_data.user_id,
      title: recipe_data.title,
      uploaded_at: recipe_data.uploaded_at,
      description: recipe_data.description,
      ingredients: recipe_data.ingredients,
      img_name: req.file.filename,
    });
    return res.status(201).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, message: "Error al publicar receta" });
  }
});

router.get("/getUserRecipes", async (req, res) => {
  let token = req.cookies.access_token;
  if (!token) {
    return res.status(403).send("Not authorized: no token provided.");
  }
  try {
    let token_decoded = jwt.verify(token, process.env.SEED_AUTENTICACION);
    let recipes = await Receta.findAll({
      where: { user_id: token_decoded.user },
    });
    return res.status(201).json({ ok: true, recipes });
  } catch (e) {
    res.status(500).json({ ok: false, message: "Error en obtener recetas" });
  }
});

export default router;
