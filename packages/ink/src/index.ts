import { StoryMachineCompiler } from "@story-machines/core";
import {
  InkCompiler,
  InkExternalFuncCompiler,
  InkStoryCompiler,
  InkSyncStateCompiler,
} from "./machines";

export * from "./machines";
export * from "./utils/effect-parser";

export const InkElements: Record<string, StoryMachineCompiler> = {
  Ink: InkCompiler,
  InkExternalFunc: InkExternalFuncCompiler,
  InkStory: InkStoryCompiler,
  InkSyncState: InkSyncStateCompiler,
};
