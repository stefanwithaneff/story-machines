import { StoryMachine } from "../machines/base-classes/story-machine";
import { ProcessFn } from "../types";

const staticMixin = {
  id: "FUNCTIONAL_MACHINE",
  machineTypes: [],
  attrs: {},
  init() {},
  save() {},
  load(state: any) {},
};

export function createStoryMachine(fn: ProcessFn): StoryMachine {
  return {
    ...staticMixin,
    process: fn,
  };
}
