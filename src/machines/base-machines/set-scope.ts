import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { Context, Result } from "../../types";
import { setOnScope } from "../../utils/scope";
import { Expression, ExpressionParser } from "../../utils/expression-parser";

export interface SetScopeAttributes extends StoryMachineAttributes {
  key: string;
  expression: Expression;
}

export class SetScope extends StoryMachine<SetScopeAttributes> {
  process(context: Context): Result {
    try {
      const val = this.attrs.expression.calc(context);
      setOnScope(context, this.attrs.key, val);
    } catch (e) {
      return { status: "Terminated" };
    }

    return { status: "Completed" };
  }
}

export const SetScopeCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const { key, textContent } = tree.attributes;

    const expression = ExpressionParser.tryParse(textContent);

    return new SetScope({ key, expression });
  },
};
