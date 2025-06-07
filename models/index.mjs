import { Like } from "./Like.mjs";
import { Receta } from "./Recetas.mjs";
import { User } from "./User.mjs";

// Definir relaciones
Receta.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Receta, { foreignKey: "user_id" });
Like.belongsTo(Receta, { foreignKey: "post_id" });
User.hasMany(Like, { foreignKey: "user_id" });

export { Receta, User };
