/**
 * URL codec for the modal stack.
 *
 * All open modals are encoded in a single `modal` query param, layered on top
 * of the current path so the underlying module never unmounts. The param holds
 * a STACK of frames (open order), supporting modals that open other modals:
 *
 *   ?modal=add-contact
 *   ?modal=add-contact,category-edit;id=7
 *   ?modal=job-detail;id=42;tab=logs
 *
 * Encoding:
 *   - Frames are separated by ","   (stack order = open order)
 *   - Within a frame: the modal KEY first, then ";"-separated "key=value" pairs
 *   - Values are scalars only (ids, mode, tab). Modals fetch their own data by id.
 */

export const MODAL_PARAM = "modal";

const FRAME_SEPARATOR = ",";
const FIELD_SEPARATOR = ";";
const KV_SEPARATOR = "=";

export type ModalParams = Record<string, string>;

export interface ModalFrame {
  /** Registry key identifying which modal component to render. */
  key: string;
  /** Scalar params (ids, mode, tab, ...). */
  params: ModalParams;
}

function isValidKey(key: string): boolean {
  // kebab-case keys only; guards against malformed/injected values.
  return /^[a-z0-9-]+$/.test(key);
}

/** Decode the raw `modal` query value into an ordered stack of frames. */
export function decodeModalStack(
  raw: string | null | undefined
): ModalFrame[] {
  if (!raw) return [];

  const frames: ModalFrame[] = [];
  for (const rawFrame of raw.split(FRAME_SEPARATOR)) {
    const trimmed = rawFrame.trim();
    if (!trimmed) continue;

    const [key, ...fields] = trimmed.split(FIELD_SEPARATOR);
    if (!key || !isValidKey(key)) continue;

    const params: ModalParams = {};
    for (const field of fields) {
      if (!field) continue;
      const idx = field.indexOf(KV_SEPARATOR);
      if (idx === -1) continue;
      const k = field.slice(0, idx).trim();
      const v = field.slice(idx + 1).trim();
      if (k) params[k] = v;
    }

    frames.push({ key, params });
  }

  return frames;
}

/** Encode a stack of frames back into a `modal` query value (or null if empty). */
export function encodeModalStack(frames: ModalFrame[]): string | null {
  if (!frames.length) return null;

  const encoded = frames
    .map((frame) => {
      const fields = [frame.key];
      for (const [k, v] of Object.entries(frame.params ?? {})) {
        if (v === undefined || v === null || v === "") continue;
        fields.push(`${k}${KV_SEPARATOR}${String(v)}`);
      }
      return fields.join(FIELD_SEPARATOR);
    })
    .join(FRAME_SEPARATOR);

  return encoded || null;
}

/** True when the two stacks are identical (same order, keys, and params). */
export function modalStacksEqual(a: ModalFrame[], b: ModalFrame[]): boolean {
  return encodeModalStack(a) === encodeModalStack(b);
}
