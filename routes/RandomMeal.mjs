import cron from "node-cron";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { title } from "process";

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

    // transform and organize the data from the API
    let processed_meal = {
      title: "",
      ingredients: [],
      description: "",
      youtube_link: "",
      img: "",
      origin: "",
      category: "",
    };

    processed_meal.title = meal.strMeal;
    processed_meal.description = meal.strInstructions;
    processed_meal.youtube_link = meal.strYouTube;
    processed_meal.img = meal.strMealThumb;
    processed_meal.origin = meal.strArea;
    processed_meal.category = meal.strCategory;

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

    console.log(`Datos guardados en ${filename}`);
  } catch (error) {
    console.error("Error al obtener datos:", error.message);
  }
}

cron.schedule(
  "* 23 * * *",
  () => {
    fetchAndSaveData();
  },
  {
    schedule: true,
    timezone: "America/Mexico_City",
  }
);
