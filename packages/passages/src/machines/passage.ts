import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
  Sequence,
  ImmediateSequence,
  Scoped,
  Once,
  Wait,
  isOfType,
  ProcessorMachine,
} from "@story-machines/core";

import { AddPassage } from "./add-passage";
import { PASSAGE_BUILDER } from "./constants";

interface PassageAttributes extends StoryMachineAttributes {
  builders: StoryMachine[];
  nodes: StoryMachine[];
}

export class PassageMachine extends ProcessorMachine<PassageAttributes> {
  protected createProcessor() {
    return new ImmediateSequence({
      children: [
        new Scoped({
          child: new Once({
            id: this.generateId("once"),
            child: new Sequence({
              children: [...this.attrs.builders, new AddPassage({})],
            }),
          }),
        }),
        ...this.attrs.nodes,
        new Wait({ id: this.generateId("wait") }),
      ],
    });
  }
}

export const PassageCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);

    const builders = children.filter((node) => isPassageBuilder(node));
    const nodes = children.filter((node) => !isPassageBuilder(node));

    return new PassageMachine({ ...tree.attributes, builders, nodes });
  },
};

function isPassageBuilder(node: StoryMachine): boolean {
  return isOfType(node, PASSAGE_BUILDER);
}
