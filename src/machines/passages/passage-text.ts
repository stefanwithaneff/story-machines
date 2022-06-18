import { Context, Result } from "../../types";
import {
  Expression,
  parseAll,
  replaceWithParsedExpressions,
} from "../../utils/expression-parser";
import { setOnContext } from "../../utils/scope";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { PASSAGE_BUILDER, PASSAGE_TEXT } from "./constants";

interface PassageTextAttributes extends StoryMachineAttributes {
  expressions: Expression[];
}

export class PassageText extends StoryMachine<PassageTextAttributes> {
  machineTypes: symbol[] = [PASSAGE_BUILDER];
  init() {}
  save() {}
  load() {}
  process(context: Context): Result {
    const evalText = replaceWithParsedExpressions(
      context,
      this.attrs.expressions,
      this.attrs.textContent ?? ""
    );

    const cleanedText = evalText.replace(/\s+/gm, " ");

    setOnContext(context, PASSAGE_TEXT, cleanedText);
    return { status: "Completed" };
  }
}

export const PassageTextCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const expressions: Expression[] = parseAll(tree.attributes.textContent);
    return new PassageText({
      ...tree.attributes,
      expressions,
    });
  },
};
