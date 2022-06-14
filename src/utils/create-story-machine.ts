import { StoryMachine } from "../machines/base-classes/story-machine";
import { Context, ProcessFn } from "../types";

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

type ConditionalFn = (context: Context) => boolean;
export function createConditionalMachine(fn: ConditionalFn): StoryMachine {
  return {
    ...staticMixin,
    process: (context: Context) => {
      const completed = fn(context);

      return { status: completed ? "Completed" : "Terminated" };
    },
  };
}
