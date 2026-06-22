"use client";

export interface TimelineOverlayProps {
  /** Number of vertical day partitions (28-31 for month view, 7 for week view). */
  daysCount: number;
  todayLineLeftPct: number | null;
  /** Pixel offset from the left edge — matches the timeline's left column width. */
  leftOffsetPx: number;
  /** Pixel height of the day-label header row — top of the today line clears it. */
  headerHeightPx: number;
}

/**
 * Single overlay spanning the entire timeline column (header + body) so the
 * day partitions and the today line are continuous across all rows. Sits
 * above the colored bars so partitions remain visible through them.
 */
export function TimelineOverlay({
  daysCount,
  todayLineLeftPct,
  leftOffsetPx,
  headerHeightPx,
}: TimelineOverlayProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute top-0 right-0 bottom-0 z-30"
      style={{ left: `${leftOffsetPx}px` }}
    >
      <div className="absolute inset-0 grid auto-cols-fr grid-flow-col">
        {Array.from({ length: daysCount }, (_, i) => (
          <div
            key={i}
            className="border-border-subtle/50 border-r last:border-r-0"
          />
        ))}
      </div>
      {todayLineLeftPct !== null ? (
        <span
          aria-hidden
          className="bg-foreground absolute bottom-0 z-30 w-px"
          style={{
            left: `${todayLineLeftPct}%`,
            top: headerHeightPx,
            maskImage:
              "linear-gradient(to bottom, black 0%, black 96%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 96%, transparent 100%)",
          }}
        />
      ) : null}
    </div>
  );
}
