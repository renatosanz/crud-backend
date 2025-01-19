import { Receta } from "./Recetas.mjs";
import { User } from "./User.mjs";

// Definir relaciones
Receta.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Receta, { foreignKey: "user_id" });

export { Receta, User };
