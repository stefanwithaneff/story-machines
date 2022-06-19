import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
  Expression,
  parseAll,
  ProcessorMachine,
} from "@story-machines/core";

import { PassageText } from "./passage-text";
import { PassageMachine } from "./passage";

interface TextAttributes extends StoryMachineAttributes {
  expressions: Expression[];
}

export class Text extends ProcessorMachine<TextAttributes> {
  protected createProcessor(): StoryMachine {
    return new PassageMachine({
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
