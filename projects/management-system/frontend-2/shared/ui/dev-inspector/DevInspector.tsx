"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Crosshair, X } from "lucide-react";

interface InspectedInfo {
  tag: string;
  id: string;
  classes: string[];
  text: string;
  width: number;
  height: number;
  component: string | null;
  styles: Record<string, string>;
}

/** CSS properties surfaced in the details panel (label → computed key). */
const STYLE_FIELDS: { label: string; key: string }[] = [
  { label: "Color", key: "color" },
  { label: "Background", key: "background-color" },
  { label: "Font size", key: "font-size" },
  { label: "Font weight", key: "font-weight" },
  { label: "Font family", key: "font-family" },
  { label: "Line height", key: "line-height" },
  { label: "Padding", key: "padding" },
  { label: "Margin", key: "margin" },
  { label: "Border", key: "border" },
  { label: "Border radius", key: "border-radius" },
  { label: "Display", key: "display" },
];

const SELF_ATTR = "data-dev-inspector";

/** Best-effort React component name via the element's fiber chain. */
function reactComponentName(el: Element): string | null {
  const key = Object.keys(el).find(
    (k) =>
      k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$")
  );
  if (!key) return null;
  let fiber = (el as unknown as Record<string, { type?: unknown; return?: unknown }>)[key];
  let depth = 0;
  while (fiber && depth < 40) {
    const type = fiber.type as
      | { displayName?: string; name?: string; render?: { name?: string } }
      | string
      | undefined;
    if (typeof type === "function") {
      const fn = type as { displayName?: string; name?: string };
      if (fn.displayName || fn.name) return fn.displayName || fn.name || null;
    } else if (type && typeof type === "object") {
      if (type.displayName) return type.displayName;
      if (type.render?.name) return type.render.name;
    }
    fiber = fiber.return as typeof fiber;
    depth += 1;
  }
  return null;
}

function gatherInfo(el: Element): InspectedInfo {
  const cs = getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  const styles: Record<string, string> = {};
  for (const { key } of STYLE_FIELDS) styles[key] = cs.getPropertyValue(key).trim();
  return {
    tag: el.tagName.toLowerCase(),
    id: el.id,
    classes: Array.from(el.classList),
    text: (el.textContent || "").trim().slice(0, 140),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    component: reactComponentName(el),
    styles,
  };
}

export function DevInspector() {
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [inspecting, setInspecting] = useState(false);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const [info, setInfo] = useState<InspectedInfo | null>(null);

  const dragState = useRef<{
    dragging: boolean;
    moved: boolean;
    offsetX: number;
    offsetY: number;
  }>({ dragging: false, moved: false, offsetX: 0, offsetY: 0 });

  // Default position: bottom-right, after we know the viewport.
  useEffect(() => {
    setMounted(true);
    setPos({ x: window.innerWidth - 64, y: window.innerHeight - 140 });
  }, []);

  const isSelf = useCallback(
    (target: EventTarget | null) =>
      target instanceof Element && !!target.closest(`[${SELF_ATTR}]`),
    []
  );

  // Inspect mode: highlight on hover, capture on click, Esc to exit.
  useEffect(() => {
    if (!inspecting) return undefined;

    const onMove = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target || isSelf(target)) {
        setHoverRect(null);
        return;
      }
      setHoverRect(target.getBoundingClientRect());
    };
    const onClick = (event: MouseEvent) => {
      if (isSelf(event.target)) return;
      event.preventDefault();
      event.stopPropagation();
      const target = event.target as Element | null;
      if (target) {
        setInfo(gatherInfo(target));
        setInspecting(false);
        setHoverRect(null);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setInspecting(false);
    };

    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [inspecting, isSelf]);

  // Button drag.
  const onPointerDown = (event: React.PointerEvent) => {
    dragState.current = {
      dragging: true,
      moved: false,
      offsetX: event.clientX - pos.x,
      offsetY: event.clientY - pos.y,
    };
    (event.target as Element).setPointerCapture?.(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragState.current.dragging) return;
    const x = event.clientX - dragState.current.offsetX;
    const y = event.clientY - dragState.current.offsetY;
    if (Math.abs(event.clientX - (pos.x + dragState.current.offsetX)) > 4)
      dragState.current.moved = true;
    setPos({
      x: Math.max(4, Math.min(window.innerWidth - 44, x)),
      y: Math.max(4, Math.min(window.innerHeight - 44, y)),
    });
  };
  const onPointerUp = () => {
    const wasDrag = dragState.current.moved;
    dragState.current.dragging = false;
    if (!wasDrag) setInspecting((value) => !value);
  };

  if (!mounted) return null;

  return (
    <div {...{ [SELF_ATTR]: "" }} className="print:hidden">
      {/* Hover highlight overlay */}
      {inspecting && hoverRect ? (
        <div
          className="border-accent pointer-events-none fixed z-[2147483646] border-2 bg-[var(--color-accent,#a3e635)]/10"
          style={{
            left: hoverRect.left,
            top: hoverRect.top,
            width: hoverRect.width,
            height: hoverRect.height,
          }}
        />
      ) : null}

      {/* Floating draggable button */}
      <button
        aria-label="Inspect element"
        className={`fixed z-[2147483647] flex h-11 w-11 cursor-grab touch-none items-center justify-center rounded-full shadow-lg transition-opacity active:cursor-grabbing ${
          inspecting
            ? "bg-accent text-black opacity-100 ring-2 ring-black/20"
            : "bg-zinc-900 text-white opacity-30 hover:opacity-100 dark:bg-white dark:text-black"
        }`}
        style={{ left: pos.x, top: pos.y }}
        title={inspecting ? "Click an element to inspect (Esc to cancel)" : "Inspect element"}
        type="button"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <Crosshair className="h-5 w-5" />
      </button>

      {/* Hint while inspecting */}
      {inspecting ? (
        <div className="bg-accent fixed top-3 left-1/2 z-[2147483647] -translate-x-1/2 rounded-full px-4 py-1.5 text-sm font-medium text-black shadow-lg">
          Click any element to inspect · Esc to cancel
        </div>
      ) : null}

      {/* Details panel */}
      {info ? (
        <div className="bg-bg-surface-elevated border-border-subtle text-text-primary fixed right-4 bottom-20 z-[2147483647] max-h-[70vh] w-[min(22rem,92vw)] overflow-y-auto rounded-xl border shadow-2xl">
          <div className="border-border-subtle bg-bg-surface sticky top-0 flex items-center justify-between gap-2 border-b px-4 py-2.5">
            <span className="text-sm font-semibold">Element details</span>
            <button
              aria-label="Close inspector details"
              className="text-text-muted hover:text-text-primary"
              type="button"
              onClick={() => setInfo(null)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3 px-4 py-3 text-sm">
            <div className="flex flex-wrap items-center gap-1.5">
              <code className="bg-accent/15 text-accent rounded px-1.5 py-0.5 text-xs font-semibold">
                &lt;{info.tag}&gt;
              </code>
              {info.component ? (
                <code className="bg-bg-app rounded px-1.5 py-0.5 text-xs">
                  {info.component}
                </code>
              ) : null}
              <span className="text-text-muted text-xs">
                {info.width} × {info.height}
              </span>
            </div>

            {info.id ? (
              <Row label="ID" value={`#${info.id}`} mono />
            ) : null}

            {info.classes.length ? (
              <div>
                <p className="text-text-muted mb-1 text-xs font-medium">
                  Classes
                </p>
                <div className="flex flex-wrap gap-1">
                  {info.classes.map((cls) => (
                    <code
                      key={cls}
                      className="bg-bg-app text-text-secondary rounded px-1.5 py-0.5 text-[11px]"
                    >
                      {cls}
                    </code>
                  ))}
                </div>
              </div>
            ) : null}

            {info.text ? <Row label="Text" value={info.text} /> : null}

            <div>
              <p className="text-text-muted mb-1 text-xs font-medium">Styles</p>
              <dl className="space-y-1">
                {STYLE_FIELDS.map(({ label, key }) =>
                  info.styles[key] ? (
                    <div
                      key={key}
                      className="flex items-start justify-between gap-3"
                    >
                      <dt className="text-text-muted text-xs">{label}</dt>
                      <dd className="text-text-primary max-w-[60%] truncate text-right font-mono text-xs">
                        {info.styles[key]}
                      </dd>
                    </div>
                  ) : null
                )}
              </dl>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-text-muted mb-1 text-xs font-medium">{label}</p>
      <p
        className={`text-text-primary break-words text-xs ${mono ? "font-mono" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
