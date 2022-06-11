import { Context, Result } from "../../types";
import {
  Expression,
  parseAll,
  replaceWithParsedExpressions,
} from "../../utils/expression-parser";
import { initScope } from "../../utils/scope";
import {
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { ChoiceBuilder } from "./choice-builder";
import { CHOICE_TEXT } from "./constants";

interface ChoiceTextAttributes extends StoryMachineAttributes {
  expressions: Expression[];
}

export class ChoiceText extends ChoiceBuilder<ChoiceTextAttributes> {
  process(context: Context): Result {
    const evalText = replaceWithParsedExpressions(
      context,
      this.attrs.expressions,
      this.attrs.textContent ?? ""
    );
    try {
      initScope(context, CHOICE_TEXT, evalText);
    } catch (e) {
      return { status: "Terminated" };
    }
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
