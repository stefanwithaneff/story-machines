import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { Context, ProcessFn, Result } from "../../types";
import { initScope } from "../../utils/scope";
import { Expression, ExpressionParser } from "../../utils/expression-parser";

export interface InitScopeInternalAttributes extends StoryMachineAttributes {
  key: string;
  val?: any;
  getter?: (context: Context) => any;
}

export class InitScopeInternal extends StoryMachine<InitScopeInternalAttributes> {
  init() {}
  save() {}
  load() {}
  process(context: Context): Result {
    const { key, val, getter } = this.attrs;
    const value = getter ? getter(context) : val;

    try {
      initScope(context, key, value);
    } catch (e) {
      return { status: "Terminated" };
    }

    return { status: "Completed" };
  }
}

export interface InitScopeAttributes extends StoryMachineAttributes {
  key: string;
  expression: Expression;
}

export class InitScope extends StoryMachine<InitScopeAttributes> {
  init() {}
  save() {}
  load() {}
  process(context: Context): Result {
    try {
      const val = this.attrs.expression.calc(context);
      initScope(context, this.attrs.key, val);
    } catch (e) {
      return { status: "Terminated" };
    }

    return { status: "Completed" };
  }
}

export const InitScopeCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const { key, textContent } = tree.attributes;

    const expression = ExpressionParser.tryParse(textContent);

    return new InitScope({ key, expression });
  },
};
