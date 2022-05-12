import { set } from "lodash";
import { StoryMachine, StoryMachineRuntime } from "./story-machine";
import { ProcessorFactory, ProcessFn, Context, Result } from "./types";

export class SetContext extends StoryMachine {
  protected generateProcessFn(): ProcessFn {
    const { key, value } = this.tree.attributes;
    return setContext(key, value);
  }
}

export const setContext: ProcessorFactory<[string, any]> = (
  key: string,
  val: any
): ProcessFn => {
  return (context: Context): Result => {
    set(context, key, val);
    return { status: "Completed" };
  };
};

StoryMachineRuntime.registerMachines(SetContext);
