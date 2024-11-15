import express from "express";
import dotenv from "dotenv";
import mysql from "mysql";
import cors from "cors";

dotenv.config(); //cargar el .env

//configurar express
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.SERVER_PORT;

//conexion con la base de datos
const con = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USR_DB,
  password: process.env.PSW_DB,
  database: process.env.NAME_DB,
  port: process.env.DB_PORT,
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
  // crear tabla de usuarios si no lo esta creada
  // var sql =
  //   "CREATE TABLE users (id INT, name VARCHAR(255  ),email VARCHAR(255  ), age INT(3), city VARCHAR(255),country VARCHAR(255),balance INT(100))";
  // con.query(sql, function (err, result) {
  // if (err) throw err;
  //   console.log("Table created");
  // });
});

//API urls y metodos
app.get("/", (req, res) => {
  res.send("Welcome to my server!");
});
app.post("/", (req, res) => {
  console.log(req);
  res.send("Welcome to my server!");
});

// registrar usuario
app.post("/user", (req, res) => {
  console.log(req.body);
  con.query("INSERT INTO users SET ?", req.body, (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return;
    }
    console.log("Data inserted successfully!");
    res.send(result)
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
