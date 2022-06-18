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
import { PASSAGE_BUILDER, PASSAGE_TEXT } from "./constants";

interface PassageTextAttributes extends StoryMachineAttributes {
  expressions: Expression[];
}

export class PassageText extends StoryMachine<PassageTextAttributes> {
  machineTypes: symbol[] = [PASSAGE_BUILDER];
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
    const expressions: Expression[] = parseAll(
      tree.attributes.textContent ?? ""
    );
    return new PassageText({
      ...tree.attributes,
      expressions,
    });
  },
};
