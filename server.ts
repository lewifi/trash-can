import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { DeadProject, INITIAL_DUMPS } from "./src/server/initial-data";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const port = 3000;

// Initialize Google GenAI Client safely
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
} catch (e) {
  console.error("Failed to initialize GoogleGenAI client:", e);
}

// Data persistence file
const DATA_FILE = path.join(process.cwd(), "graveyard_data.json");
function loadGraveyardData(): DeadProject[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("Error loading graveyard data:", error);
  }
  // If file doesn't exist, create it with default populated data
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_DUMPS, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write initial datafile:", e);
  }
  return INITIAL_DUMPS;
}

// Helper to save graveyard items
function saveGraveyardData(data: DeadProject[]): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving graveyard data:", error);
  }
}

const app = express();
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// API: Get all dumps (public/unlocked)
app.get("/api/dumps", (req, res) => {
  const data = loadGraveyardData();
  // Filter out private dumps unless specifically requested (handled by rooms)
  const publicDumps = data.filter(d => !d.isPrivate);
  res.json(publicDumps);
});

// API: Dump a project
app.post("/api/dumps", (req, res) => {
  const {
    name,
    description,
    category,
    causeOfDeath,
    emotionalTragedy,
    techStack,
    artifactIcon,
    creator,
    latitude,
    longitude,
    isPrivate,
    roomPassword,
    roomName,
    imageUrl
  } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: "Name and Description are required and cannot be empty." });
  }

  // Pick random coordinates if not provided (scattered on earth)
  const finalLat = latitude !== undefined ? Number(latitude) : (Math.random() * 120 - 60);
  const finalLng = longitude !== undefined ? Number(longitude) : (Math.random() * 320 - 160);

  const newDump: DeadProject = {
    id: "dump-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    name: String(name).slice(0, 80),
    description: String(description).slice(0, 2000), // Allow longer standard descriptions
    category: category || "other",
    causeOfDeath: String(causeOfDeath || "Natural Rot").slice(0, 100),
    emotionalTragedy: Number(emotionalTragedy) || 5,
    techStack: String(techStack || "None declared").slice(0, 200),
    artifactIcon: artifactIcon || "skull",
    likes: 0,
    flowers: 0,
    creator: String(creator || "Anonymous Grave-keeper").slice(0, 60),
    createdAt: new Date().toISOString(),
    latitude: finalLat,
    longitude: finalLng,
    isPrivate: !!isPrivate,
    roomPassword: roomPassword ? String(roomPassword) : undefined,
    roomName: roomName ? String(roomName) : undefined,
    imageUrl: imageUrl ? String(imageUrl) : undefined,
    diagnosticScore: Math.floor(Math.random() * 35) + 65 // Random glitch score 65-100
  };

  const currentData = loadGraveyardData();
  currentData.push(newDump);
  saveGraveyardData(currentData);

  res.status(201).json(newDump);
});

// API: Like a dump (upvote/memorialize)
app.post("/api/dumps/:id/like", (req, res) => {
  const { id } = req.params;
  const { type } = req.body; // 'like' or 'flower'
  const currentData = loadGraveyardData();
  const index = currentData.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Cemetery vault not found." });
  }

  if (type === "flower") {
    currentData[index].flowers += 1;
  } else {
    currentData[index].likes += 1;
  }

  saveGraveyardData(currentData);
  res.json(currentData[index]);
});

// API: Team venting pressure-valve rooms
app.get("/api/rooms/:roomName", (req, res) => {
  const { roomName } = req.params;
  const password = req.query.password as string;

  const currentData = loadGraveyardData();
  // Filter for private matches
  const matchingDumps = currentData.filter(
    d => d.isPrivate && d.roomName?.toLowerCase() === roomName.toLowerCase()
  );

  if (matchingDumps.length === 0) {
    return res.json([]);
  }

  // Check the password of the first item (all items in dynamic group share password)
  const roomLock = matchingDumps[0].roomPassword;
  if (roomLock && roomLock !== password) {
    return res.status(403).json({ error: "Access denied. Toxic fumes detected. Enter matching containment key." });
  }

  // Mask passwords
  const safeDumps = matchingDumps.map(d => {
    const { roomPassword, ...safe } = d;
    return safe;
  });

  res.json(safeDumps);
});

// API: Live AI waste management consultant / appraisal using Gemini-3.5-flash
app.post("/api/appraise", async (req, res) => {
  const { name, description, category, causeOfDeath, techStack } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: "Project name and tragedy description are required for an appraisal." });
  }

  if (!ai) {
    return res.json({
      score: 87,
      report: `[API Keys Not Configured]
A professional critique of your project "${name}":
This project, suffering from "${causeOfDeath || "unexplained sudden death"}", represents a high-pedigree tragedy.
Using ${techStack || "unspecified technologies"}, it is a brilliant contender for the Glitch Graveyard.
To make this work in real life, consider deleting all node_modules, walking into the sunlight, and trying again.
Highly commended artifact rating of 8.7/10. Dump with pride.`,
    });
  }

  try {
    const prompt = `You are the chief "Waste Management Consultant" at Glitch Graveyard (trash-can.net). 
Your job is to write a hilariously accurate, highly critical but oddly encouraging diagnostic post-mortem report and appraisal for a user's dead project.

Project Name: ${name}
Category: ${category}
Tragedy Description: ${description}
Cause of Death: ${causeOfDeath}
Tech Stack: ${techStack}

Respond strictly in a valid JSON format with the following keys and data types:
{
  "score": <number from 0 to 100 representing the project's tragic 'glitch rating'>,
  "appraisal": "<a witty 1-2 sentence final summary value of the idea>",
  "postMortem": "<a cohesive paragraph of humorous analysis of why it failed>",
  "recyclingPlan": "<a 1-2 sentence funny, yet actually creative plan on how to reuse this codebase or asset to make money, or what pivot to make>"
}

Ensure the response is clean, formatted as JSON, and contains no raw markdown, backticks, or comments around it other than the raw JSON output. Do not mention any API restrictions. Make it full of personality!`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    let resultText = response.text || "";
    // Sanitize in case model returned backticks
    if (resultText.includes("```json")) {
      resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    } else if (resultText.includes("```")) {
      resultText = resultText.replace(/```/g, "").trim();
    }

    try {
      const parsed = JSON.parse(resultText);
      return res.json(parsed);
    } catch (parseErr) {
      console.error("Failed to parse Gemini response as JSON. Raw text was:", resultText);
      // Fallback
      return res.json({
        score: Math.floor(Math.random() * 30) + 70,
        appraisal: `The tragic demise of "${name}" is verified. Diagnostic systems appreciate your sacrifice.`,
        postMortem: `This project was killed by "${causeOfDeath || "technological fatigue"}". Given that it relied on "${techStack || "existential hope"}", its failure was mathematically inevitable yet magnificent.`,
        recyclingPlan: `Extract the logo, mint it as a relic, and sell the domain name trash-can.net to an enthusiast.`
      });
    }

  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: "The AI consultant is currently mourning a dead script. Please try calling later." });
  }
});

// Setup Vite config in dev mode, static serving in prod
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });

    // Use vite's connect instance as middleware
    app.use(vite.middlewares);

    // Serve HTML
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        // Apply Vite HTML transforms (HMR/module loading injection)
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Serve static files compiled with "npm run build"
    app.use(express.static(path.resolve(process.cwd(), "dist")));

    app.get("*", (req, res) => {
      res.sendFile(path.resolve(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(port, () => {
    console.log(`💀 Glitch Graveyard active on http://localhost:${port}`);
  });
}

startServer();
