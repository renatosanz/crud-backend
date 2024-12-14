import { DataTypes } from "sequelize";
import { sequelize } from "../setupDB.mjs";

export const BackupFile = sequelize.define(
  "BackupFile",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    file_data: {
      type: DataTypes.BLOB("long"), // Almacena el archivo como binario
      allowNull: false,
    },
    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "backup_files",
    timestamps: false,
    underscored: true,
  }
);
