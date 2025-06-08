import cron from "node-cron";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DATA_DIR = path.join(__dirname, "../api-data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Función para hacer la petición y guardar datos
async function fetchAndSaveData() {
  try {
    const response = await axios.get(
      "https://www.themealdb.com/api/json/v1/1/random.php"
    );

    const filename = `random_meal.json`;
    const meal = response.data.meals[0];

    console.log("🍽️ Comida aleatoria:", {
      nombre: meal.strMeal,
      categoría: meal.strCategory,
      área: meal.strArea,
      instrucciones: meal.strInstructions.slice(0, 100) + "...", // Resumen
      imagen: meal.strMealThumb,
    });

    const {
      strMeal,
      strInstructions,
      strYouTube,
      strMealThumb,
      strArea,
      strCategory,
      strSource,
    } = meal;

    // transform and organize the data from the API
    let processed_meal = {
      title: strMeal || "",
      ingredients: [],
      description: strInstructions || "",
      youtube_link: strYouTube || "",
      img: strMealThumb || "",
      origin: strArea || "",
      category: strCategory || "",
      source: strSource || "",
      author: "themealdb.com",
    };

    for (let i = 1; i < 20; i++) {
      if (meal["strIngredient" + i] != "" && meal["strMeasure" + i] != "") {
        processed_meal.ingredients.push(
          `${meal["strIngredient" + i]} - ${meal["strMeasure" + i]}`
        );
      }
    }

    fs.writeFileSync(
      path.join(DATA_DIR, filename),
      JSON.stringify(processed_meal, null, 2)
    );
  } catch (error) {
    console.error("Error al obtener datos:", error.message);
  }
}

cron.schedule(
  "0 0 * * *",
  () => {
    fetchAndSaveData();
  },
  {
    timezone: "America/Mexico_City",
  }
);
