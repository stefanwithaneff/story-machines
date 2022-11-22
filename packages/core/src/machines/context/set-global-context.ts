import { set, toPath } from "lodash";
import { Context, ElementTree, Result } from "../../types";
import { Expression, ExpressionParser } from "../../utils/expression-parser";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineClass,
} from "../../base-classes";
import { StaticImplements } from "../../utils/static-implements";
import { StoryMachineRuntime } from "../../runtime";

interface SetGlobalContextInternalAttributes extends StoryMachineAttributes {
  key: string;
  valFn: (context: Context) => any;
}

export class SetGlobalContextInternal extends StoryMachine<SetGlobalContextInternalAttributes> {
  process(context: Context): Result {
    const { key, valFn } = this.attrs;
    const keyPath = toPath(key);
    const val = valFn(context);
    set(context, keyPath, val);
    return { status: "Completed" };
  }
}

interface SetGlobalContextAttributes extends StoryMachineAttributes {
  key: string;
  expression: Expression;
}

@StaticImplements<StoryMachineClass>()
export class SetGlobalContext extends StoryMachine<SetGlobalContextAttributes> {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { key, textContent } = tree.attributes;
    const expression = ExpressionParser.tryParse(textContent);
    return new SetGlobalContext({ ...tree.attributes, key, expression });
  }

  process(context: Context): Result {
    const { key, expression } = this.attrs;
    const keyPath = toPath(key);
    const val = expression.calc(context);
    set(context, keyPath, val);
    return { status: "Completed" };
  }
}
