import express from "express";
import { User } from "../models/User.mjs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const router = express.Router();

// user login
router.post("/login", async (req, res) => {
  try {
    let body = req.body;

    // busca la usuario en la db
    let user_db = await User.findOne({ where: { email: body.email } });
    if (!user_db) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "Usuario o contraseña incorrectos",
        },
      });
    }

    // valida que la contraseña escrita por el usuario, sea la almacenada en la db
    if (!bcrypt.compareSync(body.password, user_db.password)) {
      return res.status(400).json({
        ok: false,
        err: {
          message: "Usuario o contraseña incorrectos",
        },
      });
    }

    let token = jwt.sign(
      {
        user: user_db.dataValues.id,
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

// user register
router.post("/register", async (req, res) => {
  try {
    let userDataHashedPwd = req.body;
    bcrypt.genSalt(10, function (err, salt) {
      // gen salt
      bcrypt.hash(req.body.password, salt, async (err, hash) => {
        // hash password
        userDataHashedPwd.password = hash;
        userDataHashedPwd.id = crypto.randomUUID();
        await User.create(userDataHashedPwd);
        res
          .status(201)
          .json({ ok: true, message: "Thank you for registering to JOP" });
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
  if (!token) {
    return res.status(403).send("Not authorized: no token provided.");
  }

  try {
    let user_id = jwt.verify(token, process.env.SEED_AUTENTICACION);
    let user_db = await User.findOne({ where: { id: user_id.user } });

    res.status(200).json({
      ok: true,
      user_data: {
        username: user_db.dataValues.username,
        email: user_db.dataValues.email,
        country: user_db.dataValues.country,
        age: user_db.dataValues.age,
        storage_limit: user_db.dataValues.storage_limit,
        role: user_db.dataValues.role,
        last_login: user_db.dataValues.last_login,
        status: user_db.dataValues.status,
      },
    });
  } catch {
    return res.status(403).send("Not authorized.");
  }
});

// change user data
router.patch("/changedata", async (req, res) => {
  let token = req.cookies.access_token;
  if (!token) {
    return res.status(403).send("Not authorized: no token provided.");
  }

  try {
    let user_id = jwt.verify(token, process.env.SEED_AUTENTICACION);
    let user_db = await User.findOne({ where: { id: user_id.user } });

    // save changes in db
    user_db.username = req.body.username;
    user_db.age = req.body.age;
    user_db.save();

    // send the new user information
    res.status(200).json({
      ok: true,
      user_data: {
        username: user_db.dataValues.username,
        email: user_db.dataValues.email,
        country: user_db.dataValues.country,
        age: user_db.dataValues.age,
        storage_limit: user_db.dataValues.storage_limit,
        role: user_db.dataValues.role,
        last_login: user_db.dataValues.last_login,
        status: user_db.dataValues.status,
      },
    });
  } catch {
    return res.status(403).send("Not authorized.");
  }
});

// logout
router.post("/logout", async (req, res) => {
  let token = req.cookies.access_token;
  if (!token) {
    console.log("not auth logout");
    return res.status(403).send("Logout not authorized: no token provided.");
  }
  try {
    let user_id = jwt.verify(token, process.env.SEED_AUTENTICACION);
    let user_db = await User.findOne({ where: { id: user_id.user } });
    // save last login data
    user_db.last_login = req.body.last_login;
    user_db.save();
    console.log("logout success");
    res
      .clearCookie("access_token", { sameSite: "none", secure: true })
      .status(200)
      .json({ ok: true });
  } catch (err) {
    console.log("not auth logout");
    return res.status(403).send("Logout not authorized.");
  }
});

export default router;
