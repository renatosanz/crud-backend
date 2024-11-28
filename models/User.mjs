import { DataTypes } from "sequelize";
import { sequelize } from "../setupDB.mjs";

// Definir el modelo de Usuario
export const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true, 
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true, 
        min: 0, 
      },
    },
    balance: {
      type: DataTypes.BIGINT.UNSIGNED, 
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "users", // nombre de nuestra tabla
    timestamps: true, // incluir createdAt y updatedAt
    underscored: true, // snake_case en columnas
  }
);

