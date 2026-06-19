#!/usr/bin/env node
/*
 * Add a new graveyard entry ("dump"/story) via the live API.
 *
 * Usage:
 *   node scripts/add-dump.mjs scripts/peloton.example.json
 *   API_URL=https://trash-can.net node scripts/add-dump.mjs story.json
 *
 * story JSON fields (name + description required, rest optional):
 *   name, description, causeOfDeath, techStack, creator,
 *   category   ("saas"|"web3"|"mobile"|"ai"|"hardware"|"game"|"dev_tool"|"other"),
 *   emotionalTragedy (1-10),
 *   coords     ("lat, lng"  e.g. "40.75, -73.98"; random if omitted),
 *   image      (a URL, or a local file path -> inlined as base64),
 *   isPrivate, roomName, roomPassword
 */
import { readFileSync, existsSync } from "node:fs";
import { extname, resolve } from "node:path";

const API = (process.env.API_URL || "https://trash-can.net").replace(/\/+$/, "");
const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/add-dump.mjs <story.json>");
  process.exit(1);
}

const story = JSON.parse(readFileSync(resolve(file), "utf8"));
if (!story.name || !story.description) {
  console.error("story.json must include at least 'name' and 'description'.");
  process.exit(1);
}

// "lat, lng" -> latitude/longitude
let latitude, longitude;
if (typeof story.coords === "string" && story.coords.includes(",")) {
  const [a, b] = story.coords.split(",").map((x) => parseFloat(x.trim()));
  if (!Number.isNaN(a) && !Number.isNaN(b)) { latitude = a; longitude = b; }
}

// image: http(s)/data URLs pass through; a local path is inlined as base64
let imageUrl = story.image || story.imageUrl || undefined;
if (imageUrl && !/^https?:\/\//i.test(imageUrl) && !/^data:/i.test(imageUrl)) {
  const path = resolve(imageUrl);
  if (!existsSync(path)) { console.error("Image file not found:", path); process.exit(1); }
  const ext = (extname(path).slice(1).toLowerCase() || "png").replace("jpg", "jpeg");
  imageUrl = `data:image/${ext};base64,${readFileSync(path).toString("base64")}`;
}

const body = {
  name: story.name,
  description: story.description,
  category: story.category || "other",
  causeOfDeath: story.causeOfDeath,
  techStack: story.techStack,
  creator: story.creator || "The Archivist",
  emotionalTragedy: story.emotionalTragedy,
  isPrivate: !!story.isPrivate,
  roomName: story.roomName || undefined,
  roomPassword: story.roomPassword || undefined,
  imageUrl,
  ...(latitude !== undefined ? { latitude, longitude } : {}),
};

const res = await fetch(`${API}/api/dumps`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
const text = await res.text();
if (!res.ok) {
  console.error(`Failed (${res.status}):`, text);
  process.exit(1);
}
let out;
try { out = JSON.parse(text); } catch { out = {}; }
console.log("✓ Added:", out.name || story.name);
if (out.id) {
  console.log("  id:  ", out.id);
  console.log("  link:", `${API}/grave/${out.id}`);
}
