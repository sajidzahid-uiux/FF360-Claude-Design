export interface ContentTypeMapping {
  id: number;
  model: string;
}

export function resolveContentTypeId(
  contentTypes: ContentTypeMapping[] | undefined,
  model: string
): number {
  const contentType = contentTypes?.find((entry) => entry.model === model);
  if (!contentType) {
    throw new Error(`Content type for '${model}' not found`);
  }
  return contentType.id;
}
