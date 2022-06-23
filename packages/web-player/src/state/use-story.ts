import { Effect } from "@story-machines/core";
import { useState } from "react";
import { useStoryLoader, StoryLoaderParams } from "./use-story-loader";

interface StoryParams extends StoryLoaderParams {
  externalContext?: Record<string, any>; // Additional context that is always added for each tick of the story machine
  effectHandlers?: Record<string, (effect: Effect) => void>; // Functions that respond to effects emitted by the main story machine
}

export function useStory(params: StoryParams) {
  const { stories, failedRequests, status, manifests } = useStoryLoader(params);
  const [] = useState();
}
