import { StoryMachineCompiler } from "../base-classes/story-machine";
import { Expression, parseAll } from "../../utils/expression-parser";
import { PassageText } from "./passage-text";
import { Passage } from "./passage";

export const TextCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const expressions: Expression[] = parseAll(tree.attributes.textContent);
    return new Passage({
      builders: [
        new PassageText({
          expressions,
          textContent: tree.attributes.textContent,
        }),
      ],
      nodes: [],
    });
  },
};
