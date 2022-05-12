import { set } from "lodash";
import { StoryMachine, StoryMachineRuntime } from "./story-machine";
import { ProcessorFactory, ProcessFn, Context, Result } from "./types";

export class DeleteContext extends StoryMachine {
  protected generateProcessFn(): ProcessFn {
    const { key } = this.tree.attributes;
    return deleteContext(key);
  }
}

export const deleteContext: ProcessorFactory<[string]> = (
  key: string
): ProcessFn => {
  return (context: Context): Result => {
    set(context, key, undefined);
    return { status: "Completed" };
  };
};

StoryMachineRuntime.registerMachines(DeleteContext);
