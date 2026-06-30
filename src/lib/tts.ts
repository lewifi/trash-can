/**
 * Text-to-Speech engine configured to sound like a burly 60yo Australian scrapyard worker
 * with a very deep, gravelly voice.
 */
export function speakAppraisal(appraisal: string, postMortem: string, recyclingPlan?: string) {
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

  // 1. Look for a mature/male Australian English voice (en-AU)
  let voice = voices.find((v) => {
    const name = v.name.toLowerCase();
    const lang = v.lang.toLowerCase();
    const isAU = lang === "en-au" || lang === "en_au" || name.includes("australia") || name.includes("au-");
    const isMale = name.includes("male") || name.includes("james") || name.includes("russell") || name.includes("lee") || name.includes("natural") || name.includes("premium");
    return isAU && isMale;
  });

  // 2. Fallback to ANY Australian voice if no male AU voice is found
  if (!voice) {
    voice = voices.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      return lang === "en-au" || lang === "en_au" || name.includes("australia") || name.includes("au-");
    });
  }

  // 3. Fallback to general English male voices if no Australian voice is found
  if (!voice) {
    voice = voices.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      return (
        lang.startsWith("en") &&
        (name.includes("male") ||
          name.includes("david") ||
          name.includes("mark") ||
          name.includes("james") ||
          name.includes("natural"))
      );
    });
  }

  // 4. Fallback to any general English voice
  if (!voice) {
    voice = voices.find((v) => {
      const lang = v.lang.toLowerCase();
      return lang.startsWith("en");
    });
  }

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
