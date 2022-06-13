import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { Sequence } from "../base-machines/sequence";
import { ImmediateSequence } from "../base-machines/immediate-sequence";
import { Scoped } from "../base-machines/scoped";
import { AddPassage } from "../base-machines/add-passage";
import { Context, Result, SaveData } from "../../types";
import { Once } from "../base-machines/once";
import { Wait } from "../base-machines/wait";
import { isOfType } from "../../utils/tree-utils";
import { PASSAGE_BUILDER } from "./constants";
import { ProcessorMachine } from "../base-classes/processor-machine";

interface PassageAttributes extends StoryMachineAttributes {
  builders: StoryMachine[];
  nodes: StoryMachine[];
}

export class Passage extends ProcessorMachine<PassageAttributes> {
  protected createProcessor() {
    return new ImmediateSequence({
      children: [
        new Scoped({
          child: new Once({
            id: `once_${this.id}`,
            child: new Sequence({
              children: [...this.attrs.builders, new AddPassage({})],
            }),
          }),
        }),
        ...this.attrs.nodes,
        new Wait({ id: `wait_${this.id}` }),
      ],
    });
  }
}

export const PassageCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);

    const builders = children.filter((node) => isPassageBuilder(node));
    const nodes = children.filter((node) => !isPassageBuilder(node));

    return new Passage({ ...tree.attributes, builders, nodes });
  },
};

function isPassageBuilder(node: StoryMachine): boolean {
  return isOfType(node, PASSAGE_BUILDER);
}
