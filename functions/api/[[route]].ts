import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { GoogleGenAI } from "@google/genai";
import { DeadProject, INITIAL_DUMPS } from '../../src/server/initial-data';

type Bindings = {
  GRAVEYARD_KV: KVNamespace;
  GEMINI_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

// In-memory fallback for local development if KV namespace is not bound or configured
let memoryDumps: DeadProject[] = [...INITIAL_DUMPS];

async function loadGraveyardData(kv: KVNamespace | undefined): Promise<DeadProject[]> {
  if (kv) {
    const data = await kv.get("graveyard_dumps");
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Failed to parse KV graveyard_dumps data", e);
      }
    }
    // If KV is bound but empty, seed it with INITIAL_DUMPS
    await kv.put("graveyard_dumps", JSON.stringify(INITIAL_DUMPS));
  }
  return memoryDumps;
}

async function saveGraveyardData(kv: KVNamespace | undefined, data: DeadProject[]): Promise<void> {
  if (kv) {
    await kv.put("graveyard_dumps", JSON.stringify(data));
  } else {
    memoryDumps = data;
  }
}

// AI Client instantiation helper
let ai: GoogleGenAI | null = null;
function getAIClient(apiKey: string | undefined) {
  if (ai) return ai;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    return ai;
  }
  return null;
}

// API: Get all dumps (public/unlocked)
app.get('/dumps', async (c) => {
  const data = await loadGraveyardData(c.env.GRAVEYARD_KV);
  const publicDumps = data.filter(d => !d.isPrivate);
  return c.json(publicDumps);
});

// API: Dump a project
app.post('/dumps', async (c) => {
  const body = await c.req.json();
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
  } = body;

  if (!name || !description) {
    return c.json({ error: "Name and Description are required and cannot be empty." }, 400);
  }

  const finalLat = latitude !== undefined ? Number(latitude) : (Math.random() * 120 - 60);
  const finalLng = longitude !== undefined ? Number(longitude) : (Math.random() * 320 - 160);

  const newDump: DeadProject = {
    id: "dump-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    name: String(name).slice(0, 80),
    description: String(description).slice(0, 2000),
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
    diagnosticScore: Math.floor(Math.random() * 35) + 65
  };

  const currentData = await loadGraveyardData(c.env.GRAVEYARD_KV);
  currentData.push(newDump);
  await saveGraveyardData(c.env.GRAVEYARD_KV, currentData);

  return c.json(newDump, 201);
});

// API: Like a dump (upvote/memorialize)
app.post('/dumps/:id/like', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const { type } = body; // 'like' or 'flower'

  const currentData = await loadGraveyardData(c.env.GRAVEYARD_KV);
  const index = currentData.findIndex(item => item.id === id);

  if (index === -1) {
    return c.json({ error: "Cemetery vault not found." }, 404);
  }

  if (type === "flower") {
    currentData[index].flowers += 1;
  } else {
    currentData[index].likes += 1;
  }

  await saveGraveyardData(c.env.GRAVEYARD_KV, currentData);
  return c.json(currentData[index]);
});

// API: Team venting pressure-valve rooms
app.get('/rooms/:roomName', async (c) => {
  const roomName = c.req.param('roomName');
  const password = c.req.query('password');

  const currentData = await loadGraveyardData(c.env.GRAVEYARD_KV);
  const matchingDumps = currentData.filter(
    d => d.isPrivate && d.roomName?.toLowerCase() === roomName.toLowerCase()
  );

  if (matchingDumps.length === 0) {
    return c.json([]);
  }

  const roomLock = matchingDumps[0].roomPassword;
  if (roomLock && roomLock !== password) {
    return c.json({ error: "Access denied. Toxic fumes detected. Enter matching containment key." }, 403);
  }

  const safeDumps = matchingDumps.map(d => {
    const { roomPassword, ...safe } = d;
    return safe;
  });

  return c.json(safeDumps);
});

// API: Live AI waste management consultant / appraisal using Gemini-3.5-flash
app.post('/appraise', async (c) => {
  const body = await c.req.json();
  const { name, description, category, causeOfDeath, techStack } = body;

  if (!name || !description) {
    return c.json({ error: "Project name and tragedy description are required for an appraisal." }, 400);
  }

  const apiKey = c.env.GEMINI_API_KEY || (typeof process !== "undefined" ? process.env.GEMINI_API_KEY : undefined);
  const aiClient = getAIClient(apiKey);

  if (!aiClient) {
    return c.json({
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

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    let resultText = response.text || "";
    if (resultText.includes("```json")) {
      resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    } else if (resultText.includes("```")) {
      resultText = resultText.replace(/```/g, "").trim();
    }

    try {
      const parsed = JSON.parse(resultText);
      return c.json(parsed);
    } catch (parseErr) {
      console.error("Failed to parse Gemini response as JSON. Raw text was:", resultText);
      return c.json({
        score: Math.floor(Math.random() * 30) + 70,
        appraisal: `The tragic demise of "${name}" is verified. Diagnostic systems appreciate your sacrifice.`,
        postMortem: `This project was killed by "${causeOfDeath || "technological fatigue"}". Given that it relied on "${techStack || "existential hope"}", its failure was mathematically inevitable yet magnificent.`,
        recyclingPlan: `Extract the logo, mint it as a relic, and sell the domain name trash-can.net to an enthusiast.`
      });
    }

  } catch (err: any) {
    console.error("Gemini API Error:", err);
    return c.json({ error: "The AI consultant is currently mourning a dead script. Please try calling later." }, 500);
  }
});

export const onRequest = handle(app);
