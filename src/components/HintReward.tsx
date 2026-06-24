import { useEffect, useState } from "react";
import Confetti from "./Confetti";

/**
 * Listens for a global "hint-found" event and rewards the player with a quick
 * full-screen colour edge-glow flash + a screen shake. Fire it anywhere with:
 *   window.dispatchEvent(new Event("hint-found"))
 */
export default function HintReward() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onHint = () => {
      setActive(true);
      const el = document.documentElement;
      el.classList.remove("hint-shake");
      // reflow so the animation restarts even on rapid repeats
      void el.offsetWidth;
      el.classList.add("hint-shake");
      window.setTimeout(() => el.classList.remove("hint-shake"), 650);
      window.setTimeout(() => setActive(false), 1050);
    };
    window.addEventListener("hint-found", onHint);
    return () => window.removeEventListener("hint-found", onHint);
  }, []);

  if (!active) return null;
  return (
    <>
    <Confetti active={active} />
    <div
      className="fixed inset-0 z-[90] pointer-events-none hint-flash"
      aria-hidden="true"
      style={{
        boxShadow:
          "inset 0 0 180px 50px rgba(217,70,239,0.5), inset 0 0 90px 14px rgba(34,211,238,0.42), inset 0 0 260px 90px rgba(245,158,11,0.22)",
      }}
    />
    </>
  );
}
