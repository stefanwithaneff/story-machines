import { ProcessorMachine } from "../base-classes/processor-machine";
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

export class MultiChoice extends ProcessorMachine<MultiChoiceAttributes> {
  protected createProcessor() {
    const { choices, nodes } = this.attrs;
    return new Sequence({
      children: [new ImmediateSelector({ children: choices }), ...nodes],
    });
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
