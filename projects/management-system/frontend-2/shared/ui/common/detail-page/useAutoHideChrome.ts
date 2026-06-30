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

  // --- scroll body: track direction and toggle hidden ---
  const handleScroll = useCallback(() => {
    const el = scrollEl.current;
    if (!el) return;
    const y = el.scrollTop;
    const delta = y - lastY.current;

    if (y <= TOP_REVEAL_ZONE) {
      setHidden(false);
    } else if (delta > DIRECTION_THRESHOLD) {
      setHidden(true);
    } else if (delta < -DIRECTION_THRESHOLD) {
      setHidden(false);
    }

    if (Math.abs(delta) > DIRECTION_THRESHOLD || y <= TOP_REVEAL_ZONE) {
      lastY.current = y;
    }
  }, []);

  const scrollRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (scrollEl.current) {
        scrollEl.current.removeEventListener("scroll", handleScroll);
      }
      scrollEl.current = node;
      lastY.current = node?.scrollTop ?? 0;
      if (node && enabled) {
        node.addEventListener("scroll", handleScroll, { passive: true });
      }
    },
    [enabled, handleScroll]
  );

  // --- measure header / footer so the slide distance matches reality ---
  const headerRef = useCallback((node: HTMLDivElement | null) => {
    headerEl.current = node;
    if (node) setHeaderH(node.getBoundingClientRect().height);
  }, []);

  const footerRef = useCallback((node: HTMLDivElement | null) => {
    footerEl.current = node;
    if (node) setFooterH(node.getBoundingClientRect().height);
  }, []);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height;
        if (entry.target === headerEl.current) setHeaderH(h);
        else if (entry.target === footerEl.current) setFooterH(h);
      }
    });
    if (headerEl.current) ro.observe(headerEl.current);
    if (footerEl.current) ro.observe(footerEl.current);
    return () => ro.disconnect();
  }, []);

  // When disabled, reset so nothing stays collapsed if the prop flips off.
  useEffect(() => {
    if (!enabled) setHidden(false);
  }, [enabled]);

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
