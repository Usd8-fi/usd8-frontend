const RADIUS = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/// Small decorative ring: the arc is `share` (0 to 1) of the full circle,
/// starting at 12 o'clock. The percentage printed beside it carries the value.
export default function PercentRing({ share }) {
  if (!Number.isFinite(share) || share < 0 || share > 1) return null;
  return (
    <svg className="percent-ring" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
      <circle className="percent-ring-track" cx="10" cy="10" r={RADIUS} />
      <circle
        className="percent-ring-arc" cx="10" cy="10" r={RADIUS}
        strokeDasharray={`${(CIRCUMFERENCE * share).toFixed(3)} ${CIRCUMFERENCE.toFixed(3)}`}
        transform="rotate(-90 10 10)"
      />
    </svg>
  );
}
