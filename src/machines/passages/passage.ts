import { nanoid } from "nanoid";
import { ValidationError } from "../../utils/errors";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { Sequence } from "../base-machines/sequence";
import { ImmediateSequence } from "../base-machines/immediate-sequence";
import { Scoped } from "../base-machines/scoped";
import { AddPassage } from "../base-machines/add-passage";
import { PassageText } from "./passage-text";
import { PassageMetadata } from "./passage-metadata";
import { Context, Result } from "../../types";
import { Once } from "../base-machines/once";

interface PassageAttributes extends StoryMachineAttributes {
  builderNodes: StoryMachine[];
  otherNodes: StoryMachine[];
}

export class Passage extends StoryMachine<PassageAttributes> {
  private processor: StoryMachine;

  constructor(attrs: PassageAttributes) {
    super(attrs);

    this.processor = new ImmediateSequence({
      children: [
        new Scoped({
          child: new Once({
            child: new Sequence({
              children: [...attrs.builderNodes, new AddPassage({})],
            }),
          }),
        }),
        ...attrs.otherNodes,
      ],
    });
  }

  process(context: Context): Result {
    return this.processor.process(context);
  }
}

export const PassageCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);

    const builderNodes = children.filter((node) => isPassageBuilder(node));
    const otherNodes = children.filter((node) => !isPassageBuilder(node));

    if (builderNodes.length < 1) {
      throw new ValidationError(
        `Expected at least one of either PassageText or PassageMetadata`
      );
    }

    const id = tree.attributes.id ?? nanoid();

    // TODO: Come up with better name for attributes
    return new Passage({ builderNodes, otherNodes });
  },
};

function isPassageBuilder(node: StoryMachine): boolean {
  return [PassageText, PassageMetadata].includes(node.constructor as any);
}
