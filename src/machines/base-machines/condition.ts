import { Context, Result } from "../../types";
import { Expression, ExpressionParser } from "../../utils/expression-parser";
import { getOutputBuilder } from "../../utils/output-builder";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { createDevErrorEffect } from "../effects/dev-error";

interface ConditionAttributes extends StoryMachineAttributes {
  expression: Expression;
}

export class Condition extends StoryMachine<ConditionAttributes> {
  init() {}
  save() {}
  load() {}
  process(context: Context): Result {
    const result = this.attrs.expression.calc(context);

    if (result === true) {
      return { status: "Completed" };
    } else if (result === false) {
      return { status: "Terminated" };
    } else {
      const builder = getOutputBuilder(context);
      builder.addEffect(
        createDevErrorEffect({
          message: `Non-boolean value in Condition. Text: ${this.attrs.textContent} Value: ${result}`,
        })
      );
      return { status: "Terminated" };
    }
  }
}

export const ConditionCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const expression = ExpressionParser.tryParse(tree.attributes.textContent);
    return new Condition({ ...tree.attributes, expression });
  },
};
