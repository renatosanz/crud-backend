import express from "express";
import { Op } from "sequelize";
import multer from "multer";
import jwt from "jsonwebtoken";
import fs from "fs";
import { nanoid } from "nanoid";
import { Receta, User } from "../models/index.mjs";

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userDir = `uploads/`;
    fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}-${file.originalname}`);
  },
});

var upload = multer({ storage: storage });

const router = express.Router();

router.post("/upload", upload.single("image"), async (req, res) => {
  //console.log(req.file, req.body);
  let { user_id, title, description, ingredients, uploaded_at } = req.body;

  if (!user_id || !title || !description || !ingredients || !req.file) {
    return res
      .status(400)
      .json({ ok: false, message: "Faltan datos requeridos" });
  }

  try {
    await Receta.create({
      id: nanoid(10),
      user_id,
      title,
      uploaded_at: uploaded_at || new Date(),
      description,
      ingredients,
      img_name: req.file.filename,
    });
    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
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

router.post("/searchRecipes", async (req, res) => {
  let token = req.cookies.access_token;
  if (!token) {
    return res.status(403).send("Not authorized: no token provided.");
  }
  try {
    let searchText = req.body.search || "";
    let recipes = await Receta.findAll({
      attributes: ["id", "title", "uploaded_at", "ingredients"],
      where: {
        title: {
          [Op.like]: `%${searchText}%`,
        },
      },
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
    });

    recipes = recipes.map((r) => {
      const recipe = r.dataValues;
      recipe.num_ingredients = JSON.parse(recipe.ingredients).length;
      recipe.username = r.User.username;
      delete recipe.ingredients;
      return recipe;
    });

    return res.status(201).json({ ok: true, recipes });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: "Error en obtener recetas" });
  }
});

router.post("/getRecipe", async (req, res) => {
  let token = req.cookies.access_token;
  if (!token) {
    return res.status(403).send("Not authorized: no token provided.");
  }
  try {
    let recipe_id = req.body.recipe_id;
    let recipe = await Receta.findOne({
      attributes: [
        "description",
        "uploaded_at",
        "title",
        "ingredients",
        "img_name",
      ],
      where: { id: recipe_id },
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
    });
    recipe.ingredients = JSON.parse(recipe.ingredients);
    recipe.username = recipe.User.username;

    return res.status(201).json({ ok: true, recipe });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: "Error en obtener recetas" });
  }
});

export default router;
