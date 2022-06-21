import { StoryMachine } from "../base-classes";
import { Context, ProcessFn } from "../types";

/* istanbul ignore next */
const staticMixin = {
  id: "FUNCTIONAL_MACHINE",
  machineTypes: [],
  attrs: {},
  init() {},
  save() {},
  load() {},
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
