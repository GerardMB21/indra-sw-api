import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import express, { Request, Response, NextFunction } from "express";
import serverless from "serverless-http";
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const app = express();

const PLANETS_TABLE = process.env.PLANETS_TABLE;
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

const traduction = {
  title: "título",
  episode_id: "id de episodio",
  opening_crawl: "texto de apertura",
  director: "director",
  producer: "productor",
  release_date: "fecha de lanzamiento",
  characters: "personajes",
  planets: "planetas",
  starships: "naves espaciales",
  vehicles: "vehículos",
  species: "especies",
  url: "url",
  created: "created",
  edited: "editada",
  name: "nombre",
  height: "altura",
  mass: "masa",
  hair_color: "color de cabello",
  skin_color: "color de piel",
  eye_color: "color de ojos",
  birth_year: "año de nacimiento",
  gender: "género",
  homeworld: "mundo natal",
  films: "películas",
  rotation_period: "periodo de rotación",
  orbital_period: "periodo orbital",
  diameter: "diámetro",
  climate: "clima",
  gravity: "gravedad",
  terrain: "terreno",
  surface_water: "agua superficial",
  population: "población",
  residents: "residentes",
  classification: "clasificación",
  designation: "designación",
  average_height: "altura media",
  average_lifespan: "esperanza de vida media",
  hair_colors: "colores de cabello",
  skin_colors: "colores de piel",
  eye_colors: "colores de ojos",
  language: "lenguaje",
  people: "gente",
  model: "modelo",
  manufacturer: "fabricante",
  cost_in_credits: "costo en créditos",
  length: "longitud",
  max_atmosphering_speed: "velocidad atmosférica máxima",
  crew: "multitud",
  passengers: "pasajeros",
  cargo_capacity: "capacidad de  carga",
  consumables: "consumibles",
  hyperdrive_rating: "calificación de hiperimpulsor",
  MGLT: "MGLT",
  starship_class: "clase de nave estelar",
  pilots: "pilotos",
  vehicle_class: "clase de vehículo",
};

app.use(express.json());

app.get('/api/:service', async (req: Request, res: Response) => {
  try {
    const externalResponse = await axios.get(`https://swapi.py4e.com/api/${req.params.service}`);
    const {
      results,
      ...resExternalResponse
    } = externalResponse.data;
    const resultsTranslate: any = [];

    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      const newObj = {};

      for (const key in res) {
        const val = res[key];
        const newKey = traduction[key];

        newObj[newKey] = val;
      };

      resultsTranslate.push(newObj);
    };

    if (req.params.service == "planets") {
      const command = new ScanCommand({ TableName: PLANETS_TABLE });
      const result = await client.send(command);

      const { Items } = result;

      if (Items) {
        for (let i = 0; i < Items.length; i++) {
          const res = Items[i];
          const newObj = {};

          for (const key in res) {
            const val = res[key];
            const newKey = traduction[key];

            for (const k in val) newObj[newKey] = val[k];
          };

          resultsTranslate.push(newObj);
        };
      };
    };

    res.status(200).json({
      ...resExternalResponse,
      results: resultsTranslate
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.get('/api/:service/:id', async (req: Request, res: Response) => {
  try {
    if (req.params.service == "planets") {
      const params = {
        TableName: PLANETS_TABLE,
        Key: {
          id: req.params.id,
        },
      };
      const command = new GetCommand(params);
      const { Item } = await docClient.send(command);

      if (Item) {
        const newObj = {};

        for (const key in Item) {
          const val = Item[key];
          const newKey = traduction[key];

          newObj[newKey] = val;
        };

        res.json(newObj);
      } else {
        const externalResponse = await axios.get(`https://swapi.py4e.com/api/${req.params.service}/${req.params.id}`);
        const newObj = {};

        for (const key in externalResponse.data) {
          const val = externalResponse.data[key];
          const newKey = traduction[key];

          newObj[newKey] = val;
        };

        res.status(200).json(newObj);
      };
    } else {
      const externalResponse = await axios.get(`https://swapi.py4e.com/api/${req.params.service}/${req.params.id}`);
      const newObj = {};

      for (const key in externalResponse.data) {
        const val = externalResponse.data[key];
        const newKey = traduction[key];

        newObj[newKey] = val;
      };

      res.status(200).json(newObj);
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.get('/api/:service/schema', async (req: Request, res: Response) => {
  try {
    const externalResponse = await axios.get(`https://swapi.py4e.com/api/${req.params.service}/schema`);

    res.status(200).json(externalResponse.data);
  } catch (error) {
    res.status(500).json({ error });
  }
});

app.post("/api/planets", async (req, res) => {
  const id = uuidv4();
  const date = new Date();
  const {
    name,
    rotation_period,
    orbital_period,
    diameter,
    climate,
    gravity,
    terrain,
    surface_water,
    population,
  } = req.body;

  if (typeof name !== "string") res.status(400).json({ error: '"name" must be a string' });
  if (typeof rotation_period !== "number") res.status(400).json({ error: '"rotation_period" must be a number' });
  if (typeof orbital_period !== "number") res.status(400).json({ error: '"orbital_period" must be a number' });
  if (typeof diameter !== "number") res.status(400).json({ error: '"diameter" must be a number' });
  if (typeof climate !== "string") res.status(400).json({ error: '"climate" must be a string' });
  if (typeof gravity !== "string") res.status(400).json({ error: '"gravity" must be a string' });
  if (typeof terrain !== "string") res.status(400).json({ error: '"terrain" must be a string' });
  if (typeof surface_water !== "number") res.status(400).json({ error: '"surface_water" must be a number' });
  if (typeof population !== "number") res.status(400).json({ error: '"population" must be a number' });

  const params = {
    TableName: PLANETS_TABLE,
    Item: {
      id,
      name,
      rotation_period,
      orbital_period,
      diameter,
      climate,
      gravity,
      terrain,
      surface_water,
      population,
      residents: [],
      films: [],
      created: date.toISOString(),
      edited: date.toISOString(),
      url: `https://4wkqa4auqf.execute-api.us-east-2.amazonaws.com/api/planets/${id}`
    },
  };

  try {
    const command = new PutCommand(params);

    await docClient.send(command);

    res.json(params.Item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create planet" });
  };
});

export const handler = serverless(app);