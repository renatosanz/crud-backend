import { DataTypes } from "sequelize";
import { sequelize } from "../setupDB.mjs";
import { User } from "./User.mjs";

export const Receta = sequelize.define(
  "Receta",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    img_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ingredients: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "recipes",
    timestamps: false,
    underscored: true,
  }
);
