import { Context, ElementTree, Result } from "../types";
import { Expression, ExpressionParser } from "../utils/expression-parser";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineClass,
} from "../base-classes";
import { createDevErrorEffect } from "./effects";
import { addEffectToOutput } from "../utils/effects";
import { StaticImplements } from "../utils/static-implements";
import { StoryMachineRuntime } from "../runtime";

interface ConditionAttributes extends StoryMachineAttributes {
  expression: Expression;
}

@StaticImplements<StoryMachineClass>()
export class Condition extends StoryMachine<ConditionAttributes> {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const expression = ExpressionParser.tryParse(tree.attributes.textContent);
    return new Condition({ ...tree.attributes, expression });
  }

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
