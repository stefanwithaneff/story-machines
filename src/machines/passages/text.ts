import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { Expression, parseAll } from "../../utils/expression-parser";
import { PassageText } from "./passage-text";
import { Passage } from "./passage";
import { ProcessorMachine } from "../base-classes/processor-machine";

interface TextAttributes extends StoryMachineAttributes {
  expressions: Expression[];
}

export class Text extends ProcessorMachine<TextAttributes> {
  protected createProcessor(): StoryMachine {
    return new Passage({
      id: this.generateId("passage"),
      builders: [
        new PassageText({
          expressions: this.attrs.expressions,
          textContent: this.attrs.textContent,
        }),
      ],
      nodes: [],
    });
  }
}

export const TextCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const expressions: Expression[] = parseAll(tree.attributes.textContent);
    return new Text({ ...tree.attributes, expressions });
  },
};
