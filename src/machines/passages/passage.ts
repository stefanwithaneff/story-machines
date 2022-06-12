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
import { PassageBuilder } from "./passage-builder";
import { Wait } from "../base-machines/wait";

interface PassageAttributes extends StoryMachineAttributes {
  builders: StoryMachine[];
  nodes: StoryMachine[];
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
              children: [...attrs.builders, new AddPassage({})],
            }),
          }),
        }),
        ...attrs.nodes,
        new Wait({}),
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

    const builders = children.filter((node) => isPassageBuilder(node));
    const nodes = children.filter((node) => !isPassageBuilder(node));

    return new Passage({ ...tree.attributes, builders, nodes });
  },
};

function isPassageBuilder(node: StoryMachine): boolean {
  return node instanceof PassageBuilder;
}
