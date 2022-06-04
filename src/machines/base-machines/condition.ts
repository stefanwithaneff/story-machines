import { Context, Result } from "../../types";
import { Expression, ExpressionParser } from "../../utils/expression-parser";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";

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
      // TODO: implement DEV WARN effect for better runtime handling
      throw new Error("Non-boolean return value");
    }
  }
}

export const ConditionCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    // TODO: Should I come up with better error handling at compile time? Compile time can be runtime sometimes too...
    const expression = ExpressionParser.tryParse(tree.attributes.textContent);
    return new Condition({ expression });
  },
};
