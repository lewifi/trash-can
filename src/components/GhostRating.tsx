import { Ghost } from "lucide-react";

/**
 * 5-ghost rating derived from a 0-100 glitch score, in half-ghost increments.
 * e.g. 87 -> 4.5 ghosts. Filled ghosts are fuchsia; empty are gray outlines.
 */
export default function GhostRating({
  score = 0,
  size = 18,
  className = "",
}: {
  score?: number;
  size?: number;
  className?: string;
}) {
  const value = Math.max(0, Math.min(5, Math.round((score / 100) * 10) / 2));
  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      title={`Glitch rating: ${value} / 5`}
      aria-label={`Glitch rating ${value} out of 5`}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i)); // 0, 0.5, or 1
        return (
          <span
            key={i}
            className="relative inline-block flex-shrink-0"
            style={{ width: size, height: size }}
          >
            <Ghost
              className="absolute inset-0 text-gray-700"
              style={{ width: size, height: size }}
              strokeWidth={2}
            />
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Ghost
                  className="text-fuchsia-400"
                  style={{ width: size, height: size }}
                  strokeWidth={2}
                  fill="currentColor"
                />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
