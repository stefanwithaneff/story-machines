import { toPath } from "lodash";
import { Context, ElementTree, Result } from "../../types";
import { Expression, ExpressionParser } from "../../utils/expression-parser";
import { setOnContext } from "../../utils/scope";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineClass,
} from "../../base-classes";
import { StaticImplements } from "../../utils/static-implements";
import { StoryMachineRuntime } from "../../runtime";

interface SetContextInternalAttributes extends StoryMachineAttributes {
  key: string;
  valFn: (context: Context) => any;
}

export class SetContextInternal extends StoryMachine<SetContextInternalAttributes> {
  process(context: Context): Result {
    const { key, valFn } = this.attrs;
    const keyPath = toPath(key);
    const val = valFn(context);
    setOnContext(context, keyPath, val);
    return { status: "Completed" };
  }
}

interface SetContextAttributes extends StoryMachineAttributes {
  key: string;
  expression: Expression;
}

@StaticImplements<StoryMachineClass>()
export class SetContext extends StoryMachine<SetContextAttributes> {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { key, textContent } = tree.attributes;
    const expression = ExpressionParser.tryParse(textContent);
    return new SetContext({ ...tree.attributes, key, expression });
  }

  process(context: Context): Result {
    const { key, expression } = this.attrs;
    const keyPath = toPath(key);
    const val = expression.calc(context);
    setOnContext(context, keyPath, val);
    return { status: "Completed" };
  }
}
