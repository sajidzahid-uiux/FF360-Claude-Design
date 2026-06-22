/** XML, SHP, and KML uploads do not use file descriptions on the backend. */
export function isMapUploadFileName(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return (
    lower.includes("xml_file") ||
    lower.includes("shape_file") ||
    lower.includes("kml_file")
  );
}

export function getMapUploadAccept(fileName: string): string | undefined {
  const lower = fileName.toLowerCase();
  if (lower.includes("xml_file")) return ".xml";
  if (lower.includes("shape_file")) return ".shp";
  if (lower.includes("kml_file")) return ".kml";
  return undefined;
}
