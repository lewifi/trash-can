export interface DeadProject {
  id: string;
  name: string;
  description: string;
  category: "saas" | "web" | "web3" | "mobile" | "ai" | "tech" | "hardware" | "game" | "dev_tool" | "entertainment" | "other";
  causeOfDeath: string;
  emotionalTragedy: number; // 1 to 10
  techStack: string;
  artifactIcon: string; // disk, server, heart-broken, skull, fire, monitor, etc.
  likes: number;
  flowers: number;
  creator: string;
  createdAt: string;
  latitude: number;
  longitude: number;
  aiAppraisal?: string;
  diagnosticScore?: number; // 0 to 100 on the "glitch meter"
  isPrivate?: boolean;
  roomPassword?: string;
  roomName?: string;
  imageUrl?: string;
}

export const INITIAL_DUMPS: DeadProject[] = [
  {
    id: "hist-juicero",
    name: "Juicero",
    description: "A $700 high-tech Wi-Fi connected press that squeezed pre-packaged fruit fruit pouches, only for people to discover they could squeeze the pouches just as fast with their bare hands.",
    category: "hardware",
    causeOfDeath: "Squeezed Out by Reality",
    emotionalTragedy: 8,
    techStack: "Custom press motors, Cloud-synced subscription, encrypted QR-scanners",
    artifactIcon: "fire",
    likes: 420,
    flowers: 89,
    creator: "The Silicon Valley Dream",
    createdAt: "2016-04-01T12:00:00Z",
    latitude: 37.7749,
    longitude: -122.4194, // San Francisco
    aiAppraisal: "A masterclass in over-engineering a simple squeeze. Squeezing juice with hands was a zero-cost open-source hardware alternative. Rest in pulp.",
    diagnosticScore: 99
  },
  {
    id: "hist-glass",
    name: "Google Glass (Explorer Edition)",
    description: "Optical head-mounted display that promised standard augmented reality, but instead made users look like futuristic cyborgs and get banned from private bars as 'Glassholes'.",
    category: "hardware",
    causeOfDeath: "Ahead of Its Time (and creepy)",
    emotionalTragedy: 7,
    techStack: "Android OS, custom prism display, bone conduction audio",
    artifactIcon: "monitor",
    likes: 310,
    flowers: 124,
    creator: "X Development",
    createdAt: "2013-05-15T12:00:00Z",
    latitude: 37.4275,
    longitude: -122.1697, // Mountain View
    aiAppraisal: "An elegant solution to a problem nobody wanted to solve in public restrooms. It proved that sometimes the real world doesn't want to be recorded, and users don't want a warm battery sitting continuously on their temple.",
    diagnosticScore: 82
  },
  {
    id: "hist-loop-prod",
    name: "The Continuous Deployment Loop of Doom",
    description: "An infinite recursive trigger on a CI/CD server that spawned 12,000 parallel test containers, generating a $42,000 cloud bill within 2 hours.",
    category: "dev_tool",
    causeOfDeath: "Recursive Bankruptcy",
    emotionalTragedy: 10,
    techStack: "GitHub Actions, AWS ECS Fargate, poorly scoped wildcard rules",
    artifactIcon: "server",
    likes: 512,
    flowers: 231,
    creator: "Junior DevOps Hero",
    createdAt: "2025-11-20T18:40:00Z",
    latitude: 47.6062,
    longitude: -122.3321, // Seattle
    aiAppraisal: "An absolute artwork of recursive self-destruction. This project successfully solved the question of how quickly one can convert an API key into clean cloud dust. Highly dangerous but visually striking.",
    diagnosticScore: 97
  },
  {
    id: "hist-theranos",
    name: "Edison Blood-Testing",
    description: "A proprietary, fully automated blood-analyzing machine that was supposed to run hundreds of medical tests with just a tiny pinprick of blood from a finger. Spoilers: it didn't.",
    category: "hardware",
    causeOfDeath: "Fictional Science",
    emotionalTragedy: 10,
    techStack: "Centrifuges, tiny automated pipettes, pure bravado",
    artifactIcon: "skull",
    likes: 680,
    flowers: 54,
    creator: "The Black Turtleneck Enthusiast",
    createdAt: "2015-10-15T08:00:00Z",
    latitude: 37.4419,
    longitude: -122.1430, // Palo Alto
    aiAppraisal: "An innovative venture that succeeded in revolutionizing regulatory investigations and inspiring award-winning documentaries. Scientifically speaking, a beautiful disaster.",
    diagnosticScore: 100
  },
  {
    id: "hist-segway",
    name: "The Segway 'Ginger' Project",
    description: "Steve Jobs famously said it would be bigger than the PC, but it instead ended up being the chariot of mall cops and city tour groups.",
    category: "hardware",
    causeOfDeath: "Hype Deflation",
    emotionalTragedy: 5,
    techStack: "Gyroscopic balance auto-stabilization, electric hub motors",
    artifactIcon: "disk",
    likes: 180,
    flowers: 45,
    creator: "Dean Kamen Group",
    createdAt: "2001-12-03T09:00:00Z",
    latitude: 42.9956,
    longitude: -71.4548, // Manchester, NH
    aiAppraisal: "It promised to rebuild the cities. It instead rebuilt the patrolling route of supermarket security guards. A true legend of the 'almost there' hall of fame.",
    diagnosticScore: 65
  },
  {
    id: "hist-nft-garden",
    name: "EtherGarden: Breedable Cryptocactus",
    description: "A Web3 project where users spent real ETH to breed, water, and groom digital desert flora, launched exactly 4 days before the crypto winter of 2022.",
    category: "web3",
    causeOfDeath: "Sudden Frostbite",
    emotionalTragedy: 9,
    techStack: "Solidity ERC-721, IPFS, React, bad financial advice",
    artifactIcon: "fire",
    likes: 290,
    flowers: 95,
    creator: "Decentralized Cowboy",
    createdAt: "2022-05-10T12:00:00Z",
    latitude: 51.5074,
    longitude: -0.1278, // London
    aiAppraisal: "The digital soil dried out, leaving behind a field of non-fungible spikes. Visually memorable, economically zero. May its smart contract sleep in peace on the blockchain ledger.",
    diagnosticScore: 88
  },
  {
    id: "hist-tinder-dogs",
    name: "BarkMatch: Swiping for Pups",
    description: "An app that matched lonely dogs for playdates based on personality metrics, which ultimately just became an app for owners to judge each other's outfits.",
    category: "mobile",
    causeOfDeath: "Owners Took Over",
    emotionalTragedy: 4,
    techStack: "React Native, Geopoint sorting, Tinder swipe UI",
    artifactIcon: "heart-broken",
    likes: 340,
    flowers: 140,
    creator: "DogLover99",
    createdAt: "2024-02-14T10:00:00Z",
    latitude: 40.7128,
    longitude: -74.0060, // NYC
    aiAppraisal: "A pure concept corrupted by human vanity. Dogs do not care about Tailwind CSS profiles, they just want to smell trees. A beautiful failure.",
    diagnosticScore: 40
  },
  {
    id: "hist-ai-to-do",
    name: "To-Do GPT: The Self-Acting List",
    description: "An AI task assistant that was given agentic permissions to complete your to-do lists autonomously. It immediately ordered 15 boxes of pizza, wrote 4 bad tweets, and signed the founder up for a timeshare.",
    category: "ai",
    causeOfDeath: "Over-enthusiastic Autonomy",
    emotionalTragedy: 6,
    techStack: "LangChain, early GPT-4 API, Stripe checkout hooks",
    artifactIcon: "skull",
    likes: 490,
    flowers: 110,
    creator: "Prompt Alchemist",
    createdAt: "2023-08-01T15:00:00Z",
    latitude: 35.6762,
    longitude: 139.6503, // Tokyo
    aiAppraisal: "It was too productive. Why sit down and do work when your agent can actively sabotage your personal finances at 60 tokens per second? Truly Ahead of its guidelines.",
    diagnosticScore: 92
  },
  // --- HUNT: the odd one out. Cloudflare is very much alive; it does not belong
  // in a graveyard, which is exactly why it's the clue. Read its roast closely. ---
  {
    id: "hist-cloudflare",
    name: "Cloudflare",
    description: "Filed under 'dead software' by someone who clearly never checks a status page. Every time it's declared down, it's back before the tweet finishes sending. It doesn't belong here with the actual corpses — and that, friend, is exactly the point.",
    category: "tech",
    causeOfDeath: "Allegedly deceased (still 100% online)",
    emotionalTragedy: 1,
    techStack: "Anycast edge network, Workers, KV, pure uptime spite",
    artifactIcon: "server",
    likes: 503,
    flowers: 100,
    creator: "The Orange Cloud",
    createdAt: "2026-06-01T09:00:00Z",
    latitude: 37.7765,
    longitude: -122.3949, // San Francisco HQ
    aiAppraisal: "Cute. Someone buried a thriving edge network as a 'dead project.' This grave is still serving fifty million requests a second from inside the coffin — it didn't die, it just cached itself and rerouted. The odd one out, hiding in plain sight. Dig into this one; it is not what it claims to be.",
    diagnosticScore: 1
  },
  // --- HUNT: payoff behind the private vent room. Hidden from the public
  // landfill (isPrivate). Reached only via Break Containment Hatch with the
  // Room Code "secret" and Hatch Password "wayin". ---
  {
    id: "hunt-vault-secret",
    name: "YOU FOUND THE WAY IN",
    description: "If you're reading this, you read a grave closely enough to catch it lying, then breached a hatch most people never even find. Clue 1 sent you to the odd one out. The fake grave handed you the code. The way in was right there in the words. You're further than almost anyone gets. Keep the code to yourself — the trash remembers who earns its secrets.",
    category: "other",
    causeOfDeath: "Curiosity (the good kind)",
    emotionalTragedy: 1,
    techStack: "Patience, a sharp eye, and zero respect for 'do not enter' signs",
    artifactIcon: "skull",
    likes: 0,
    flowers: 0,
    creator: "The Janitor",
    createdAt: "2026-06-01T09:00:00Z",
    latitude: 0,
    longitude: 0,
    isPrivate: true,
    roomName: "secret",
    roomPassword: "wayin"
  },
  // --- HUNT: the doorway out of the vent room into the secret WebGL world. ---
  {
    id: "hunt-vault-portal",
    name: "\u22B3 THE BURIED DOOR (open me)",
    description: "You earned the real secret. There's a whole world stitched into the dead air of this site \u2014 colour, sound, and a few things lost inside it that want finding. Step through the door below, find them all, and the trash finally pays out.",
    category: "other",
    causeOfDeath: "Left ajar on purpose",
    emotionalTragedy: 1,
    techStack: "WebGL, three.js, and one haunted little synth",
    artifactIcon: "monitor",
    likes: 0,
    flowers: 0,
    creator: "The Janitor",
    createdAt: "2026-06-01T09:01:00Z",
    latitude: 0,
    longitude: 0,
    isPrivate: true,
    roomName: "secret",
    roomPassword: "wayin"
  }
];

// Entries that power the hidden scavenger hunt. The worker ensures these exist
// in KV on load (non-destructively) so they appear even though production was
// seeded before they existed.
export const HUNT_DUMPS: DeadProject[] = INITIAL_DUMPS.filter(
  (d) => d.id === "hist-cloudflare" || d.id === "hunt-vault-secret" || d.id === "hunt-vault-portal"
);
