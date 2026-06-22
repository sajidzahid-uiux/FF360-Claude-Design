/** Visual shell for {@link Table} — card (default) or borderless list (e.g. tile design). */
export const TableVariantEnum = {
  CARD: 'card',
  PLAIN: 'plain',
} as const;

export type TableVariant = (typeof TableVariantEnum)[keyof typeof TableVariantEnum];
