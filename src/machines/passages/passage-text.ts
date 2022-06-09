import { Context, Result } from "../../types";
import {
  Expression,
  parseAll,
  replaceWithParsedExpressions,
} from "../../utils/expression-parser";
import { getOutputBuilder } from "../../utils/output-builder";
import { setOnScope } from "../../utils/scope";
import {
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { createDevErrorEffect } from "../effects/dev-error";
import { PassageBuilder } from "./passage-builder";

interface PassageTextAttributes extends StoryMachineAttributes {
  expressions: Expression[];
}

export class PassageText extends PassageBuilder<PassageTextAttributes> {
  process(context: Context): Result {
    try {
      const evalText = replaceWithParsedExpressions(
        context,
        this.attrs.expressions,
        this.attrs.textContent ?? ""
      );

      setOnScope(context, "passageText", evalText);
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
