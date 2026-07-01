/**
 * Text-to-Speech engine configured to sound like a burly 60yo scrapyard worker
 * with a very deep, gravelly voice.
 */
export function speakAppraisal(
  appraisal: string,
  postMortem: string,
  recyclingPlan?: string,
  score?: number
) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Cancel any ongoing speaking first to avoid queue buildup
  window.speechSynthesis.cancel();

  // Combine segments with natural breaks for standard speech pacing
  const segments: string[] = [];
  if (appraisal) {
    // Strip leading/trailing quotes for natural sounding speak text
    segments.push(appraisal.replace(/^["'“]+|["'”]+$/g, "").trim());
  }
  if (postMortem) {
    segments.push(postMortem);
  }
  if (recyclingPlan) {
    segments.push(recyclingPlan);
  }

  // Spoken verdict at the very end — a funny out-of-ten rating read aloud.
  if (typeof score === "number" && !Number.isNaN(score)) {
    const outOf10 = Math.max(1, Math.min(10, Math.round(score / 10)));
    const labels = [
      "And the final dumpster level",
      "Official tragedy rating",
      "Stink score",
      "Trash-tier verdict",
      "Landfill rating",
    ];
    const label = labels[Math.floor(Math.random() * labels.length)];
    segments.push(`${label}: ${outOf10} out of 10`);
  }

  const fullText = segments.join(". ");
  const utterance = new SpeechSynthesisUtterance(fullText);

  // Deep, burly voice configurations:
  // - Pitch: Low pitch (0.5 to 0.6) simulates a very deep chest voice
  // - Rate: Slightly slower pace (0.80 to 0.85) simulates a gravelly drawl
  // - Volume: Standard (1.0)
  utterance.pitch = 0.55;
  utterance.rate = 0.82;
  utterance.volume = 1.0;

  // Fetch available voices
  const voices = window.speechSynthesis.getVoices();

  // Look for a mature/male English voice
  const voice = voices.find((v) => {
    const name = v.name.toLowerCase();
    const lang = v.lang.toLowerCase();
    
    // Prioritize English male/mature sounding voices
    return (
      (lang.startsWith("en") || lang.startsWith("en-")) &&
      (name.includes("male") ||
        name.includes("david") ||
        name.includes("mark") ||
        name.includes("natural") ||
        name.includes("premium"))
    );
  });

  if (voice) {
    utterance.voice = voice;
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Stop any ongoing Text-to-Speech output.
 */
export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
