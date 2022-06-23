import { useCallback, useEffect, useMemo, useState } from "react";
import { produce } from "immer";
import { fetchFile, FileEntry, FileType, FILE_TYPES } from "./query-client";
import { mapKeys } from "lodash";

export interface StoryLoaderParams {
  main: string; // The path to the entrypoint to the story
  baseUrl?: string; // The baseUrl to use to load stories and manifests (Defaults to '/')
  fileMaps?: Record<FileType, Record<string, any>>;
}

export type RuntimeStatus = "Loading" | "Error" | "Ready";

export interface RequestState {
  status: RuntimeStatus;
  type: FileType;
  data: any;
  error: any;
}

export interface StoryLoaderOutput {
  status: RuntimeStatus;
  stories: Record<string, string>;
  manifests: Record<string, Record<string, any>>;
  failedRequests: Array<[string, RequestState]>;
  loadFile: (fileEntry: FileEntry) => void;
}

export function useStoryLoader(params: StoryLoaderParams): StoryLoaderOutput {
  const [fileMaps, filesToLoad] = useMemo(() => {
    const maps: Record<FileType, Record<string, any>> = {
      story: {},
      manifest: {},
    };
    const toLoad: FileEntry[] = [];
    for (const fileType of FILE_TYPES) {
      for (const [filePath, data] of Object.entries(
        params.fileMaps?.[fileType] ?? {}
      )) {
        if (data === null) {
          toLoad.push({ type: fileType, filePath });
          continue;
        }
        maps[fileType][filePath] = data;
      }
    }

    if (params.fileMaps?.story[params.main] === undefined) {
      toLoad.push({ type: "story", filePath: params.main });
    }

    return [maps, toLoad];
  }, [params.fileMaps, params.main]);
  const [isPreloading, setIsPreloading] = useState(filesToLoad.length > 0);

  const [pendingRequests, setPendingRequests] = useState(
    {} as Record<string, RequestState>
  );
  const [cachedFiles, setCachedFiles] = useState(fileMaps);

  const addPendingRequest = useCallback(
    ({ filePath, type }: FileEntry) => {
      setPendingRequests(
        produce((draft) => {
          draft[filePath] = {
            type,
            status: "Loading",
            data: null,
            error: null,
          };
        })
      );
    },
    [setPendingRequests]
  );

  const addFileToCache = useCallback(
    ({ type, filePath }: FileEntry, data: any) => {
      setCachedFiles(
        produce((draft) => {
          draft[type][filePath] = data;
        })
      );
    },
    [setCachedFiles]
  );

  const updatePendingRequest = useCallback(
    ({ filePath }: FileEntry, status: RuntimeStatus, error?: any) => {
      setPendingRequests(
        produce((draft) => {
          if (status === "Error") {
            draft[filePath].status = status;
            draft[filePath].error = error;
            return;
          } else if (status === "Ready") {
            delete draft[filePath];
          }
        })
      );
    },
    []
  );

  const loadFile = useCallback(
    async (entry: FileEntry) => {
      const { type, filePath } = entry;
      if (
        pendingRequests[filePath]?.status === "Loading" ||
        cachedFiles[type][filePath] !== undefined
      ) {
        return;
      }
      addPendingRequest(entry);
      try {
        const response = await fetchFile(entry, { baseUrl: params.baseUrl });
        addFileToCache(entry, response);
        updatePendingRequest(entry, "Ready");
      } catch (e) {
        updatePendingRequest(entry, "Error", e);
      }
    },
    [
      addPendingRequest,
      addFileToCache,
      updatePendingRequest,
      cachedFiles,
      pendingRequests,
      params.baseUrl,
    ]
  );

  useEffect(() => {
    if (!isPreloading) {
      return;
    }
    Promise.all(filesToLoad.map((entry) => loadFile(entry))).then(() =>
      setIsPreloading(false)
    );
  }, [isPreloading, setIsPreloading, loadFile, filesToLoad]);

  let status: RuntimeStatus;
  const pendingRequestList = Object.entries(pendingRequests);

  if (pendingRequestList.some(([_, req]) => req.status === "Error")) {
    status = "Error";
  } else if (isPreloading || pendingRequestList.length > 0) {
    status = "Loading";
  } else {
    status = "Ready";
  }

  const failedRequests = pendingRequestList.filter(
    ([_, req]) => req.status === "Error"
  );

  return {
    status,
    stories: cachedFiles.story,
    manifests: cachedFiles.manifest,
    failedRequests,
    loadFile,
  };
}
