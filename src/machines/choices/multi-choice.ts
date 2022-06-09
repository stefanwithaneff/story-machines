import { Context, Result } from "../../types";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { ImmediateSelector } from "../base-machines/immediate-selector";
import { Sequence } from "../base-machines/sequence";
import { Choice } from "./choice";

interface MultiChoiceAttributes extends StoryMachineAttributes {
  choices: StoryMachine[];
  nodes: StoryMachine[];
}

export class MultiChoice extends StoryMachine<MultiChoiceAttributes> {
  private processor: StoryMachine;
  constructor(attrs: MultiChoiceAttributes) {
    super(attrs);

    const { choices, nodes } = attrs;

    this.processor = new Sequence({
      children: [new ImmediateSelector({ children: choices }), ...nodes],
    });
  }

  process(context: Context): Result {
    return this.processor.process(context);
  }
}

export const MultiChoiceCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);
    const choices = children.filter((child) => child instanceof Choice);
    const nodes = children.filter((child) => !(child instanceof Choice));

    return new MultiChoice({ ...tree.attributes, choices, nodes });
  },
};
