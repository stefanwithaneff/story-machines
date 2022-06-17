import { set, toPath } from "lodash";
import { Context, Result } from "../../types";
import { Expression, ExpressionParser } from "../../utils/expression-parser";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";

interface SetGlobalContextInternalAttributes extends StoryMachineAttributes {
  key: string;
  valFn: (context: Context) => any;
}

export class SetGlobalContextInternal extends StoryMachine<SetGlobalContextInternalAttributes> {
  init() {}
  save() {}
  load() {}
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

export class SetGlobalContext extends StoryMachine<SetGlobalContextAttributes> {
  init() {}
  save() {}
  load() {}
  process(context: Context): Result {
    const { key, expression } = this.attrs;
    const keyPath = toPath(key);
    const val = expression.calc(context);
    set(context, keyPath, val);
    return { status: "Completed" };
  }
}

export const SetGlobalContextCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const { key, textContent } = tree.attributes;
    const expression = ExpressionParser.tryParse(textContent);
    return new SetGlobalContext({ ...tree.attributes, key, expression });
  },
};
