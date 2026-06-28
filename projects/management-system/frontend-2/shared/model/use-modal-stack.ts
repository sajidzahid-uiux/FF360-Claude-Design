"use client";

import { useCallback, useMemo } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  decodeModalStack,
  encodeModalStack,
  MODAL_PARAM,
  type ModalFrame,
  type ModalParams,
} from "./modal-url";

/**
 * Read and mutate the URL-driven modal stack.
 *
 * Opening a modal pushes a frame (new history entry, so Back closes it).
 * The current path and all other query params are preserved, so the module
 * underneath never unmounts — a modal from one module opens over another.
 */
export function useModalStack() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = searchParams.get(MODAL_PARAM);
  const stack = useMemo(() => decodeModalStack(raw), [raw]);

  const buildUrl = useCallback(
    (frames: ModalFrame[]) => {
      const next = new URLSearchParams(searchParams.toString());
      const encoded = encodeModalStack(frames);
      if (encoded) {
        next.set(MODAL_PARAM, encoded);
      } else {
        next.delete(MODAL_PARAM);
      }
      const qs = next.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams]
  );

  /** Push a modal onto the stack (adds a history entry). */
  const openModal = useCallback(
    (key: string, params: ModalParams = {}) => {
      const current = decodeModalStack(searchParams.get(MODAL_PARAM));
      router.push(buildUrl([...current, { key, params }]));
    },
    [buildUrl, router, searchParams]
  );

  /** Replace the entire stack with a single modal (no extra frame stacking). */
  const replaceModal = useCallback(
    (key: string, params: ModalParams = {}) => {
      router.push(buildUrl([{ key, params }]));
    },
    [buildUrl, router]
  );

  /** Update the params of the top (or a specific) frame in place. */
  const updateModalParams = useCallback(
    (params: ModalParams, key?: string) => {
      const current = decodeModalStack(searchParams.get(MODAL_PARAM));
      if (!current.length) return;
      const targetIdx = key
        ? current.map((f) => f.key).lastIndexOf(key)
        : current.length - 1;
      if (targetIdx === -1) return;
      const nextStack = current.map((frame, idx) =>
        idx === targetIdx
          ? { ...frame, params: { ...frame.params, ...params } }
          : frame
      );
      router.replace(buildUrl(nextStack));
    },
    [buildUrl, router, searchParams]
  );

  /** Pop the top frame. Prefer router.back() so history stays clean. */
  const closeModal = useCallback(() => {
    const current = decodeModalStack(searchParams.get(MODAL_PARAM));
    if (!current.length) return;
    router.replace(buildUrl(current.slice(0, -1)));
  }, [buildUrl, router, searchParams]);

  /**
   * Close a specific modal by key and drop everything above it
   * (closing a mid-stack frame discards the frames opened on top of it).
   */
  const closeModalKey = useCallback(
    (key: string) => {
      const current = decodeModalStack(searchParams.get(MODAL_PARAM));
      const idx = current.map((f) => f.key).lastIndexOf(key);
      if (idx === -1) return;
      router.replace(buildUrl(current.slice(0, idx)));
    },
    [buildUrl, router, searchParams]
  );

  /** Remove all modals from the URL. */
  const closeAllModals = useCallback(() => {
    router.replace(buildUrl([]));
  }, [buildUrl, router]);

  return {
    stack,
    topModal: stack.length ? stack[stack.length - 1] : null,
    openModal,
    replaceModal,
    updateModalParams,
    closeModal,
    closeModalKey,
    closeAllModals,
  };
}
