import { Compilable } from "@story-machines/core";
import {
  InkExternalFunc,
  InkExternalFuncs,
  InkMachine,
  InkPreprocessors,
  InkPostprocessors,
  InkState,
} from "./machines";

export * from "./machines";
export * from "./utils/effect-parser";

export const InkElements: Record<string, Compilable> = {
  Ink: InkMachine,
  InkExternalFunc,
  InkExternalFuncs,
  InkPreprocessors,
  InkPostprocessors,
  InkState,
};
