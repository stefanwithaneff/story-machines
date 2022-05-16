import { DeleteContext } from "./base-machines/delete-context";
import { ImmediateSequence } from "./base-machines/immediate-sequence";
import { SetContext } from "./base-machines/set-context";
import {
  DecoratorAttributes,
  DecoratorMachine,
} from "./base-classes/decorator-machine";
import { DecoratorFactory, ProcessFn, Context, Result } from "../types";
import { StoryMachine } from "./base-classes/story-machine";

interface SetScopeAttributes extends DecoratorAttributes {
  key: string;
  val: any;
}

/**
 * Sets a value on the context, runs the child node, and then cleans up the context. Equivalent to:
 * <ParallelSequence>
 *   <SetContext key="key" val="val" />
 *   <ChildNode />
 *   <DeleteContext key="key" />
 * </ParallelSequence>
 */
export class SetScope extends DecoratorMachine<SetScopeAttributes> {
  processor: StoryMachine;

  constructor(attrs: SetScopeAttributes) {
    super(attrs);

    const { key, val } = attrs;

    this.processor = new ImmediateSequence({
      children: [
        new SetContext({ key, val }),
        this.child,
        new DeleteContext({ key }),
      ],
    });
  }

  process(context: Context): Result {
    return this.processor.process(context);
  }
}
