import { StoryMachineCompiler } from "@story-machines/core";
import {
  AddPassageCompiler,
  PassageCompiler,
  PassageMetadataCompiler,
  PassageTextCompiler,
  TextCompiler,
} from "./machines";

export * from "./machines";
export * from "./utils/add-passage-to-output";
export * from "./types";

export const PassageElements: Record<string, StoryMachineCompiler> = {
  AddPassage: AddPassageCompiler,
  PassageMetadata: PassageMetadataCompiler,
  PassageText: PassageTextCompiler,
  Passage: PassageCompiler,
  Text: TextCompiler,
};
