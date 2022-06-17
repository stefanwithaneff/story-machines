import { toPath } from "lodash";
import { Context, Result } from "../../types";
import { Expression, ExpressionParser } from "../../utils/expression-parser";
import { setOnContext } from "../../utils/scope";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";

interface SetContextInternalAttributes extends StoryMachineAttributes {
  key: string;
  valFn: (context: Context) => any;
}

export class SetContextInternal extends StoryMachine<SetContextInternalAttributes> {
  init() {}
  save() {}
  load() {}
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

export class SetContext extends StoryMachine<SetContextAttributes> {
  init() {}
  save() {}
  load() {}
  process(context: Context): Result {
    const { key, expression } = this.attrs;
    const keyPath = toPath(key);
    const val = expression.calc(context);
    setOnContext(context, keyPath, val);
    return { status: "Completed" };
  }
}

export const SetContextCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const { key, textContent } = tree.attributes;
    const expression = ExpressionParser.tryParse(textContent);
    return new SetContext({ ...tree.attributes, key, expression });
  },
};
