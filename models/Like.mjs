import { DataTypes } from "sequelize";
import { sequelize } from "../setupDB.mjs";

export const Like = sequelize.define(
  "Like",
  {
    post_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "like",
    timestamps: false,
    underscored: true,
  }
);
