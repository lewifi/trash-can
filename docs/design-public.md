# Roast Graveyard — Design Document
### trash-can.net

---

## What it is

A graveyard for dead tech projects — and something else entirely.

On the surface: you bury your failed side projects and get an AI-generated roast verdict. The landfill fills up with dead code, abandoned SaaS ideas, and NFT projects that absolutely deserved it.

Underneath: there's a hidden layer most people never find. The curious ones do.

---

## The tagline

*"The internet's graveyard for failed side projects. Not everything here is dead."*

---

## The real mechanic

The dead projects are the misdirect. Everyone arrives thinking it's a graveyard for code.

The actual hook is the self-roast. You don't need a dead project to participate — you get roasted, you cackle, you share it. The graveyard is what happens next, if you feel like burying the evidence.

Roasting a friend has social risk. Roasting yourself has none. That's why the laugh is louder and the share is instant.

**The shareable unit is the roast card — not the grave.** "Look what this site said about me" travels faster than "look at this dead project I buried." Same reason Twitter roast threads go viral and project launches don't.

---

## The audience

Not just coders. Anyone who's ever watched a company burn $500M in a month and had opinions about it. The landfill is for developers. The roast is for everyone.

Tech-adjacent people — designers, founders, people who heard about it from someone who got destroyed — are the growth vector. The site should feel native to that world without requiring you to be in it.

**Target sharer:** young women in tech. Underserved by developer tools aesthetically, more likely to share things that feel alive and fun rather than just useful. The visual language — high-contrast neon gradients, confetti, animated rewards — is pointed at them specifically.

---

## The entrance

Splash screens died because they became meaningless gates. This one is different.

The entrance sequence IS the content: a retro terminal booting into something that shouldn't exist, ending on **NOT EVERYONE / FINDS IT.**

When someone shares this site they don't send a link to a tab. They say "just go, and watch what happens." The slow opening creates the "you have to see this from the start" impulse. That's a viral mechanic, not just a design choice.

---

## The hidden layer

There's an ARG (alternate reality game) buried inside the site. Nobody is told it exists. Nobody gets a tutorial. It has multiple clues, anti-cheat mechanics, a completion timer, and a finale that switches the player to an entirely new domain and 3D experience with no warning.

The finale is a Three.js scene on `escape.trash-can.net`. Particles explode upward in fuchsia and cyan. The camera orbits. **YOU ESCAPED** arrives in a gradient. A leaderboard asks for your handle.

There is a cheater path. We're not telling you what it looks like.

Most players will never find the ARG. That's the point. The ones who do will talk about it.

---

## The leaderboard

Old internet. Arcade cabinet asking for your initials. No email, no account, no password reset.

> *"Pick a 4-digit code to protect your score. Don't lose it — we can't look it up for you."*

> **BURN IT INTO THE BOARD**

Zero PII stored. Falls under GDPR's Strictly Necessary exemption — the user opted in explicitly. No consent banner required.

---

## The growth strategy

**Organic only to start.** If it spreads it's because the thing itself is good enough. Ads amplify what works — they don't fix what doesn't. A site that proves itself without spend is a much better story.

**The waitlist feature:** a "notify me when the next big one drops" button. When a major tech failure hits the news, the list gets pinged. The site becomes a recurring event tied to cultural moments, not a one-time visit. Lewi controls the trigger manually — no automation needed to start.

**Discord watch-along:** building in public, with a community that gets to see the hidden layer being built before anyone else finds it. First person to complete the ARG gets something.

---

## Technical approach

- Cloudflare Workers + Hono — zero cold starts, edge-deployed
- Cloudflare KV for graveyard data, hunt tokens, roast cache
- D1 (SQLite at the edge) when scale demands it
- Gemini AI for roast generation, with static fallbacks
- React + Vite + Tailwind v4 frontend
- Three.js finale deployed as a separate Cloudflare Pages project
- No consent banner required — privacy designed in from the start, not bolted on

Running cost at serious traffic: negligible. The hard part was building it.

---

## Status

Live. Being built in public. The ARG is partially complete. The finale exists. The leaderboard is coming.

*"A developer graveyard with a hidden ARG that isn't finished yet. Watch it get built on Discord."*
