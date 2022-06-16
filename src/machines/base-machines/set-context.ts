import { set } from "lodash";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { Context, Result } from "../../types";
import { Expression, ExpressionParser } from "../../utils/expression-parser";

export interface SetContextInternalAttributes extends StoryMachineAttributes {
  key: string;
  val: any;
}

export class SetContextInternal extends StoryMachine<SetContextInternalAttributes> {
  init() {}
  save() {}
  load() {}
  process(context: Context): Result {
    set(context, this.attrs.key, this.attrs.val);
    return { status: "Completed" };
  }
}

export interface SetContextAttributes extends StoryMachineAttributes {
  key: string;
  expression: Expression;
}

export class SetContext extends StoryMachine<SetContextAttributes> {
  init() {}
  save() {}
  load() {}
  process(context: Context): Result {
    const val = this.attrs.expression.calc(context);
    set(context, this.attrs.key, val);
    return { status: "Completed" };
  }
}

export const SetContextCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const { key, textContent } = tree.attributes;
    const expression = ExpressionParser.tryParse(textContent);
    return new SetContext({ key, expression });
  },
};
