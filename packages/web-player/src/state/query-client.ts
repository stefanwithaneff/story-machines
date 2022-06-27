export const FILE_TYPES = ["story", "manifest"] as const;

export type FileType = typeof FILE_TYPES[number];

export interface FileEntry {
  type: FileType;
  filePath: string;
}

interface FetchOptions {
  baseUrl?: string;
}

export async function fetchFile(
  { type, filePath }: FileEntry,
  options: FetchOptions = {}
) {
  const response = await fetch(new URL(filePath, options.baseUrl));

  if (type === "story") {
    return response.text();
  } else if (type === "manifest") {
    return response.json();
  }
}
