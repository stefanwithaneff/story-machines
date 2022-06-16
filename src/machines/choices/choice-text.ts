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
import { CHOICE_BUILDER, CHOICE_TEXT } from "./constants";

interface ChoiceTextAttributes extends StoryMachineAttributes {
  expressions: Expression[];
}

export class ChoiceText extends StoryMachine<ChoiceTextAttributes> {
  machineTypes: symbol[] = [CHOICE_BUILDER];
  init() {}
  save() {}
  load() {}
  process(context: Context): Result {
    const evalText = replaceWithParsedExpressions(
      context,
      this.attrs.expressions,
      this.attrs.textContent ?? ""
    );
    setOnContext(context, CHOICE_TEXT, evalText);
    return { status: "Completed" };
  }
}

export const ChoiceTextCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const expressions: Expression[] = parseAll(tree.attributes.textContent);
    return new ChoiceText({
      ...tree.attributes,
      expressions,
    });
  },
};
