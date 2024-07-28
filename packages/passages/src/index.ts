import { Compilable } from "@story-machines/core";
import { PassageMachine } from "./machines";

export * from "./machines";
export * from "./utils/add-passage-to-output";
export * from "./types";

export const PassageElements: Record<string, Compilable> = {
  Passage: PassageMachine,
};
