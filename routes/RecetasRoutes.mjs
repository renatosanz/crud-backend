import express from "express";
import { Op } from "sequelize";
import multer from "multer";
import jwt from "jsonwebtoken";
import fs from "fs";
import { nanoid } from "nanoid";
import { Receta, User } from "../models/index.mjs";

const UPLOADS_DIR = "uploads/";

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}.png`);
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
      .json({ ok: false, message: "Required data is missing" });
  }

  try {
    Receta.create({
      id: nanoid(10),
      user_id,
      title,
      uploaded_at: uploaded_at || new Date(),
      description,
      ingredients,
      img_name: req.file.filename,
    }).then(() =>
      User.findOne({ where: { id: user_id } }).then((user) => {
        //increment recipes_count by one
        user.recipes_count++;
        user.save();
      })
    );
    return res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: "Error publishing recipe" });
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
      attributes: ["id", "title", "uploaded_at", "description"],
    });
    return res.status(201).json({ ok: true, recipes });
  } catch (e) {
    res.status(500).json({ ok: false, message: "Error getting user recipes" });
  }
});

router.post("/searchRecipes", async (req, res) => {
  let token = req.cookies.access_token;
  if (!token) {
    return res.status(403).send("Not authorized: no token provided.");
  }
  let searchText = req.body.search || "";
  try {
    let recipes = await Receta.findAll({
      attributes: ["id", "title", "uploaded_at", "ingredients"],
      where: {
        title: {
          [Op.iLike]: `%${searchText}%`,
        },
      },
      limit: 10,
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
    res.status(500).json({
      ok: false,
      message: `Error searching recipes for ${searchText} `,
    });
  }
});

router.get("/getRecipe", async (req, res) => {
  let token = req.cookies.access_token;
  if (!token) {
    return res.status(403).send("Not authorized: no token provided.");
  }
  try {
    let recipe_id = req.query.id;
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
    res.status(500).json({ ok: false, message: "Error getting recipes" });
  }
});

router.delete("/deleteRecipe", async (req, res) => {
  let token = req.cookies.access_token;
  if (!token) {
    return res.status(403).send("Not authorized: no token provided.");
  }
  const { recipe_id } = req.body;
  try {
    Receta.findOne({
      where: { id: recipe_id },
    })
      .then(async (post) => {
        await deletePostImage(post.dataValues.img_name); // delete image on backend
        User.findOne({ where: { id: post.dataValues.user_id } }).then(
          (user) => {
            //decrement recipes_count by one
            user.recipes_count--;
            user.save();
          }
        );
        post.destroy();
      })
      .then(() => res.status(200).json({ ok: true }));
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ ok: false, message: `Error deleting recipe ${recipe_id}.` });
  }
});

const deletePostImage = async (filename) => {
  fs.unlink(UPLOADS_DIR + filename, (err) => {
    if (err) throw err;
    console.log(`${UPLOADS_DIR + filename} was deleted`);
  });
};

export default router;
