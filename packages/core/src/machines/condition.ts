import { Context, Result } from "../types";
import { Expression, ExpressionParser } from "../utils/expression-parser";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes";
import { createDevErrorEffect } from "./effects";
import { addEffectToOutput } from "../utils/effects";

interface ConditionAttributes extends StoryMachineAttributes {
  expression: Expression;
}

export class Condition extends StoryMachine<ConditionAttributes> {
  process(context: Context): Result {
    const result = this.attrs.expression.calc(context);

    if (result === true) {
      return { status: "Completed" };
    } else if (result === false) {
      return { status: "Terminated" };
    } else {
      addEffectToOutput(
        context,
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
