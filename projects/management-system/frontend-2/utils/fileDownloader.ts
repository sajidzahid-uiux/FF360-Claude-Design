import { saveAs } from "file-saver";

/**
 * Fetches a file from the given URL and triggers a download with the specified filename.
 * @param url - The URL to fetch (e.g. presigned S3 URL).
 * @param filename - The name to use for the downloaded file.
 * @returns `true` if the download succeeded, `false` otherwise (e.g. network/CORS error).
 */
export async function downloadFile(
  url: string,
  filename: string
): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const blob = await response.blob();
    saveAs(blob, filename);
    return true;
  } catch {
    return false;
  }
}
