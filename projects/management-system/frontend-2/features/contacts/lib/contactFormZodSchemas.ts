import { z } from "zod";

/** API may send `id: null` on contact detail rows; Zod optional() does not accept null. */
export const contactDetailRowSchema = z
  .object({
    id: z.number().nullish(),
    name: z.string(),
    phone_number: z.string(),
    label: z.string(),
    is_primary: z.boolean(),
  })
  .transform((row) => ({
    ...row,
    id: row.id ?? undefined,
  }));

export const contactFormMapDataSchema = z.object({
  location: z.object({ lat: z.number(), lng: z.number() }).nullable(),
  vertices: z.array(z.object({ lat: z.number(), lng: z.number() })),
});

export const contactFormCategoryIdsSchema = z
  .array(z.number().nullish())
  .transform((ids) =>
    ids.filter(
      (id): id is number => typeof id === "number" && Number.isFinite(id)
    )
  );
