import { Context, Result } from "../../types";
import {
  Expression,
  parseAll,
  replaceWithParsedExpressions,
} from "../../utils/expression-parser";
import { getOutputBuilder } from "../../utils/output-builder";
import { initScope } from "../../utils/scope";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { createDevErrorEffect } from "../effects/dev-error";
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
    try {
      const evalText = replaceWithParsedExpressions(
        context,
        this.attrs.expressions,
        this.attrs.textContent ?? ""
      );

      initScope(context, PASSAGE_TEXT, evalText);
    } catch (e) {
      const builder = getOutputBuilder(context);
      builder.addEffect(createDevErrorEffect({ message: e.message }));
      return { status: "Terminated" };
    }
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
