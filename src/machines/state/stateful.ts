import { Context, Result } from "../../types";
import { isOfType } from "../../utils/tree-utils";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { MemorySequence } from "../base-machines/memory-sequence";
import { Scoped } from "../base-machines/scoped";
import { STATE_BUILDER } from "./constants";
import { State } from "./state";

interface StatefulAttributes extends StoryMachineAttributes {
  builders: StoryMachine[];
  nodes: StoryMachine[];
}

export class Stateful extends StoryMachine<StatefulAttributes> {
  private processor: StoryMachine;

  constructor(attrs: StatefulAttributes) {
    super(attrs);

    this.processor = new Scoped({
      child: new MemorySequence({
        children: [
          ...this.attrs.builders,
          new Scoped({
            child: new State({
              child: new MemorySequence({ children: this.attrs.nodes }),
            }),
          }),
        ],
      }),
    });
  }

  process(context: Context): Result {
    return this.processor.process(context);
  }
}

export const StatefulCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);

    const builders = children.filter((child) => isOfType(child, STATE_BUILDER));
    const nodes = children.filter((child) => !isOfType(child, STATE_BUILDER));

    return new Stateful({ builders, nodes });
  },
};
