import express from "express";
import { Receta } from "../models/Recetas.mjs";
import multer from "multer";
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
  // TODO: guardar las recetas en base de datos {name,upload-date,description,img_name}
  res.status(200).json("ok");
});

export default router;
