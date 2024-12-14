import { DataTypes } from "sequelize";
import { sequelize } from "../setupDB.mjs";
import { BackupFile } from "./BackupFile.mjs";

export const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        min: 3,
        max: 20,
      },
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
      validate: {
        min: 2,
      },
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
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
    storage_limit: {
      type: DataTypes.INTEGER, // en MB
      defaultValue: 500, // límite predeterminado de almacenamiento
    },
    backup_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    last_login: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "banned"),
      defaultValue: "active",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);

User.hasMany(BackupFile, { foreignKey: "user_id" });
