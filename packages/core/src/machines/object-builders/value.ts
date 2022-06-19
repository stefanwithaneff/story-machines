import { Context, Result } from "../../types";
import { Expression, ExpressionParser } from "../../utils/expression-parser";
import { getFromContext, setOnContext } from "../../utils/scope";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../../base-classes";
import { KEY_PREFIX } from "./constants";

interface ValueAttributes extends StoryMachineAttributes {
  key?: string;
  expression: Expression;
}

export class Value extends StoryMachine<ValueAttributes> {
  process(context: Context): Result {
    const val = this.attrs.expression.calc(context);
    const keyPrefix: string[] = getFromContext(context, KEY_PREFIX);

    if (!keyPrefix) {
      return { status: "Terminated" };
    }

    const keyPath: string[] = this.attrs.key
      ? [...keyPrefix, this.attrs.key]
      : keyPrefix;

    setOnContext(context, keyPath, val);

    return { status: "Completed" };
  }
}

export const ValueCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const expression = ExpressionParser.tryParse(tree.attributes.textContent);
    return new Value({ expression, key: tree.attributes.key });
  },
};
