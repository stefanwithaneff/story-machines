import {
  Context,
  Result,
  Expression,
  parseAll,
  replaceWithParsedExpressions,
  setOnContext,
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "@story-machines/core";
import { CHOICE_BUILDER, CHOICE_TEXT } from "./constants";

interface ChoiceTextAttributes extends StoryMachineAttributes {
  expressions: Expression[];
}

export class ChoiceText extends StoryMachine<ChoiceTextAttributes> {
  machineTypes: symbol[] = [CHOICE_BUILDER];
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
