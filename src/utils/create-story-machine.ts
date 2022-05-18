import { StoryMachine } from "../machines/base-classes/story-machine";
import { ProcessFn } from "../types";

export function createStoryMachine(fn: ProcessFn): StoryMachine {
  return {
    process: fn,
    id: "FUNCTIONAL_MACHINE",
    attrs: {},
  };
}
