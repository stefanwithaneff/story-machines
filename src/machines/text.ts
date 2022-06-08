import { StoryMachineCompiler } from "./base-classes/story-machine";
import { Expression, parseAll } from "../utils/expression-parser";
import { PassageText } from "./passages/passage-text";
import { Passage } from "./passages/passage";

export const TextCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const expressions: Expression[] = parseAll(tree.attributes.textContent);
    return new Passage({
      builderNodes: [
        new PassageText({
          expressions,
          textContent: tree.attributes.textContent,
        }),
      ],
      otherNodes: [],
    });
  },
};
