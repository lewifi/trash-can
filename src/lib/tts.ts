/**
 * Text-to-Speech engine configured to sound like a seasoned Australian bushman
 * in his late sixties. He has a weathered, gravelly voice, speaking with a
 * wise, patient, and grounded storyteller/mentor tone.
 * Prioritizes the "Zubenelgenubi" voice profile if available.
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

  // Wise, patient, weathered storyteller voice configurations:
  // - Pitch: Low pitch (0.5 to 0.6) simulates a very weathered chest voice
  // - Rate: Slower pace (0.75 to 0.80) simulates a patient, grounded storyteller drawl
  // - Volume: Standard (1.0)
  utterance.pitch = 0.55;
  utterance.rate = 0.78;
  utterance.volume = 1.0;

  // Fetch available voices
  const voices = window.speechSynthesis.getVoices();

  // 1. Look for the Zubenelgenubi voice profile first
  let voice = voices.find((v) => {
    const name = v.name.toLowerCase();
    return name.includes("zubenelgenubi");
  });

  // 2. Look for a mature/male Australian English voice (en-AU)
  if (!voice) {
    voice = voices.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      const isAU = lang === "en-au" || lang === "en_au" || name.includes("australia") || name.includes("au-");
      const isMale = name.includes("male") || name.includes("james") || name.includes("russell") || name.includes("lee") || name.includes("natural") || name.includes("premium");
      return isAU && isMale;
    });
  }

  // 3. Fallback to ANY Australian voice if no male AU voice is found
  if (!voice) {
    voice = voices.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      return lang === "en-au" || lang === "en_au" || name.includes("australia") || name.includes("au-");
    });
  }

  // 4. Fallback to general English male voices if no Australian voice is found
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

  // 5. Fallback to any general English voice
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
