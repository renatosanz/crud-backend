import express from "express";
import { User } from "../models/User.mjs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const router = express.Router();

// LOGIN de la app
router.post("/login", async (req, res) => {
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
    }

    let token = jwt.sign(
      {
        user: usuarioDB.dataValues.id,
      },
      process.env.SEED_AUTENTICACION,
      {
        expiresIn: process.env.CADUCIDAD_TOKEN,
      }
    );
    res
      .cookie("access_token", token, {
        maxAge: 90 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .status(200)
      .json({ ok: true });
  } catch (error) {
    console.error("Error on login:", error);
    res.status(500).json({ error: "Error while logging." });
  }
});

// registrar un usuario
router.post("/register", async (req, res) => {
  try {
    let userDataHashedPwd = req.body;
    bcrypt.genSalt(10, function (err, salt) {
      // generar un salt
      bcrypt.hash(req.body.password, salt, async (err, hash) => {
        // hashear el password
        userDataHashedPwd.password = hash;
        userDataHashedPwd.id = crypto.randomUUID();
        await User.create(userDataHashedPwd);
        res.status(201).json({ message: "Thank you for registering to JOP" });
      });
    });
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: "Error on registering user" });
  }
});

// get protected data
router.get("/protected", async (req, res) => {
  let token = req.cookies.access_token;
  console.log("token", token);
  if (!token) {
    return res.status(403).send("Not authorized: no token provided.");
  }

  try {
    let user_id = jwt.verify(token, process.env.SEED_AUTENTICACION);
    console.log("user_id: ", user_id.user);
    let user_db = await User.findOne({ where: { id: user_id.user } });

    res.status(200).json({
      ok: true,
      data: {
        username: user_db.dataValues.username,
        balance: user_db.dataValues.balance,
        country: user_db.dataValues.country,
        age: user_db.dataValues.age,
      },
    });
  } catch {
    return res.status(403).send("Not authorized.");
  }
});

// logout
router.get("/logout", async (req, res) => {
  res
    .clearCookie("access_token", { sameSite: "none", secure: true })
    .status(200)
    .json();
});

export default router;
