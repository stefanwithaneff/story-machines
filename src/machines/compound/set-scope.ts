import { set } from "lodash";
import { deleteContext } from "../base/delete-context";
import { parallelSequence } from "../base/parallel-sequence";
import { setContext } from "../base/set-context";
import { DecoratorMachine, StoryMachineRuntime } from "../base/story-machine";
import { DecoratorFactory, ProcessFn, Context, Result } from "../base/types";

/**
 * Sets a value on the context, runs the child node, and then cleans up the context. Equivalent to:
 * <ParallelSequence>
 *   <SetContext key="key" val="val" />
 *   <ChildNode />
 *   <DeleteContext key="key" />
 * </ParallelSequence>
 */
export class SetScope extends DecoratorMachine {
  protected generateProcessFn(): ProcessFn {
    const { key, value } = this.tree.attributes;

    return setScope(this.node.process, key, value);
  }
}

export const setScope: DecoratorFactory<[string, any]> = (
  fn: ProcessFn,
  key: string,
  val: any
) => {
  return parallelSequence([setContext(key, val), fn, deleteContext(key)]);
};

StoryMachineRuntime.registerMachines(SetScope);
