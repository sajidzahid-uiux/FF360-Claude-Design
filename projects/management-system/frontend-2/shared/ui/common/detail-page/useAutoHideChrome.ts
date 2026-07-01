"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Drives the "hide the header + sticky footer while scrolling down, bring them
 * back on scroll up" behavior for detail pages.
 *
 * The header and footer stay in normal flex flow; when hidden we apply a
 * negative margin equal to their measured height so they slide out of view
 * (clipped by the page root's `overflow-hidden`) and the scroll body grows to
 * fill the reclaimed space. Heights are measured with a ResizeObserver so the
 * collapse distance always matches the real chrome height (toolbars wrap,
 * one-call date appears/disappears, etc.).
 */
export interface AutoHideChrome {
  /** Attach to the scrollable body — its scroll drives the show/hide. */
  scrollRef: (node: HTMLDivElement | null) => void;
  /** Wrap the header; measured so we know how far to slide it up. */
  headerRef: (node: HTMLDivElement | null) => void;
  /** Wrap the footer; measured so we know how far to slide it down. */
  footerRef: (node: HTMLDivElement | null) => void;
  /** Inline style for the header wrapper (collapses upward when hidden). */
  headerStyle: React.CSSProperties;
  /** Inline style for the footer wrapper (collapses downward when hidden). */
  footerStyle: React.CSSProperties;
}

// Ignore scroll noise below this delta so a trembling trackpad doesn't flicker
// the chrome. Direction only flips once movement clears the threshold.
const DIRECTION_THRESHOLD = 8;
// Always reveal the chrome within this distance of the top.
const TOP_REVEAL_ZONE = 12;
const TRANSITION = "margin 280ms cubic-bezier(0.4, 0, 0.2, 1)";

export function useAutoHideChrome(enabled: boolean): AutoHideChrome {
  const [hidden, setHidden] = useState(false);
  const [headerH, setHeaderH] = useState(0);
  const [footerH, setFooterH] = useState(0);

  const scrollEl = useRef<HTMLDivElement | null>(null);
  const headerEl = useRef<HTMLDivElement | null>(null);
  const footerEl = useRef<HTMLDivElement | null>(null);
  const lastY = useRef(0);
  // Snapshot of the scroll geometry at the last handled event. Collapsing the
  // chrome grows the flex body, which shrinks the max scrollTop; near the
  // bottom the browser clamps scrollTop and fires a spurious "scroll up" event.
  // We detect those by the changed geometry and resync instead of flipping.
  const lastScrollH = useRef(0);
  const lastClientH = useRef(0);
  // Mirror hidden + chrome heights in refs so the dependency-free scroll
  // handler reads current values without a stale closure.
  const hiddenRef = useRef(false);
  const headerHRef = useRef(0);
  const footerHRef = useRef(0);

  const applyHidden = useCallback((next: boolean) => {
    hiddenRef.current = next;
    setHidden(next);
  }, []);

  // --- scroll body: track direction and toggle hidden ---
  const handleScroll = useCallback(() => {
    const el = scrollEl.current;
    if (!el) return;
    const y = el.scrollTop;
    const maxScroll = el.scrollHeight - el.clientHeight;

    const layoutChanged =
      el.scrollHeight !== lastScrollH.current ||
      el.clientHeight !== lastClientH.current;
    lastScrollH.current = el.scrollHeight;
    lastClientH.current = el.clientHeight;

    // Always show the chrome near the top, or when there isn't enough content
    // to scroll back up once it's hidden. Without this, a short page (e.g. a
    // repair job with few fields) can hide the chrome and then have nothing
    // left to scroll — leaving it gone for good.
    if (y <= TOP_REVEAL_ZONE || maxScroll <= TOP_REVEAL_ZONE) {
      applyHidden(false);
      lastY.current = y;
      return;
    }

    // A scroll fired because our own collapse/expand animation resized the
    // body, not because the user moved. Rebase the anchor and bail so we
    // don't oscillate near the bottom.
    if (layoutChanged) {
      lastY.current = y;
      return;
    }

    const delta = y - lastY.current;

    if (delta > DIRECTION_THRESHOLD) {
      // Only hide if, once hidden, there's still room to scroll back up and
      // reveal it again (hiding grows the body by the chrome height).
      const chromeH = headerHRef.current + footerHRef.current;
      const maxScrollWhenHidden = hiddenRef.current ? maxScroll : maxScroll - chromeH;
      if (maxScrollWhenHidden > TOP_REVEAL_ZONE) {
        applyHidden(true);
      }
    } else if (delta < -DIRECTION_THRESHOLD) {
      applyHidden(false);
    }

    if (Math.abs(delta) > DIRECTION_THRESHOLD) {
      lastY.current = y;
    }
  }, [applyHidden]);

  const scrollRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (scrollEl.current) {
        scrollEl.current.removeEventListener("scroll", handleScroll);
      }
      scrollEl.current = node;
      lastY.current = node?.scrollTop ?? 0;
      lastScrollH.current = node?.scrollHeight ?? 0;
      lastClientH.current = node?.clientHeight ?? 0;
      if (node && enabled) {
        node.addEventListener("scroll", handleScroll, { passive: true });
      }
    },
    [enabled, handleScroll]
  );

  // --- measure header / footer so the slide distance matches reality ---
  const headerRef = useCallback((node: HTMLDivElement | null) => {
    headerEl.current = node;
    if (node) {
      const h = node.getBoundingClientRect().height;
      headerHRef.current = h;
      setHeaderH(h);
    }
  }, []);

  const footerRef = useCallback((node: HTMLDivElement | null) => {
    footerEl.current = node;
    if (node) {
      const h = node.getBoundingClientRect().height;
      footerHRef.current = h;
      setFooterH(h);
    }
  }, []);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        if (entry.target === headerEl.current) {
          headerHRef.current = h;
          setHeaderH(h);
        } else if (entry.target === footerEl.current) {
          footerHRef.current = h;
          setFooterH(h);
        }
      }
    });
    if (headerEl.current) ro.observe(headerEl.current);
    if (footerEl.current) ro.observe(footerEl.current);
    return () => ro.disconnect();
  }, []);

  // When disabled, reset so nothing stays collapsed if the prop flips off.
  useEffect(() => {
    if (!enabled) applyHidden(false);
  }, [enabled, applyHidden]);

  if (!enabled) {
    return {
      scrollRef,
      headerRef,
      footerRef,
      headerStyle: {},
      footerStyle: {},
    };
  }

  return {
    scrollRef,
    headerRef,
    footerRef,
    headerStyle: {
      marginTop: hidden ? -headerH : 0,
      transition: TRANSITION,
      willChange: "margin-top",
    },
    footerStyle: {
      marginBottom: hidden ? -footerH : 0,
      transition: TRANSITION,
      willChange: "margin-bottom",
    },
  };
}
