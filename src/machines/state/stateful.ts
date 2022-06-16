import { SaveData } from "../../types";
import { isOfType } from "../../utils/tree-utils";
import { ProcessorMachine } from "../base-classes/processor-machine";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { MemorySequence } from "../base-machines/memory-sequence";
import { Scoped } from "../context/scoped";
import { STATE_BUILDER } from "./constants";
import { State } from "./state";

interface StatefulAttributes extends StoryMachineAttributes {
  builders: StoryMachine[];
  nodes: StoryMachine[];
}

// TODO: Figure out a way to combine State and Stateful
export class Stateful extends ProcessorMachine<StatefulAttributes> {
  save(saveData: SaveData) {
    super.save(saveData);
    delete saveData[this.generateId("memory_seq_outer")];
  }

  protected createProcessor() {
    return new Scoped({
      child: new MemorySequence({
        id: this.generateId("memory_seq_outer"),
        children: [
          ...this.attrs.builders,
          new Scoped({
            child: new State({
              id: this.generateId("state"),
              child: new MemorySequence({
                id: this.generateId("memory_seq_inner"),
                children: this.attrs.nodes,
              }),
            }),
          }),
        ],
      }),
    });
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
