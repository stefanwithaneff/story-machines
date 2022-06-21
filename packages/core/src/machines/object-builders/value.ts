import { Context, Result } from "../../types";
import { Expression, ExpressionParser } from "../../utils/expression-parser";
import { getFromContext, setOnContext } from "../../utils/scope";
import {
  ProcessorMachine,
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../../base-classes";
import { KEY_PREFIX } from "./constants";
import { Sequence } from "../sequence";
import { createStoryMachine } from "../../utils/create-story-machine";

interface ValueAttributes extends StoryMachineAttributes {
  expression: Expression;
}

export class Value extends StoryMachine<ValueAttributes> {
  process(context: Context): Result {
    const val = this.attrs.expression.calc(context);
    const keyPrefix: string[] = getFromContext(context, KEY_PREFIX);

    if (!keyPrefix) {
      return { status: "Terminated" };
    }

    setOnContext(context, keyPrefix, val);

    return { status: "Completed" };
  }
}

export const ValueCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const expression = ExpressionParser.tryParse(tree.attributes.textContent);
    return new Value({ ...tree.attributes, expression });
  },
};

interface NestedValueAttributes extends ValueAttributes {
  key: string;
}

export class NestedValue extends ProcessorMachine<NestedValueAttributes> {
  protected createProcessor(): StoryMachine<StoryMachineAttributes> {
    let keyPrefix: string[];
    return new Sequence({
      children: [
        createStoryMachine((context) => {
          keyPrefix = getFromContext(context, KEY_PREFIX);
          keyPrefix?.push(this.attrs.key);
          return { status: "Completed" };
        }),
        new Value({ expression: this.attrs.expression }),
        createStoryMachine((context) => {
          keyPrefix.pop();
          return { status: "Completed" };
        }),
      ],
    });
  }
}

export const NestedValueCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const expression = ExpressionParser.tryParse(tree.attributes.textContent);
    return new NestedValue({
      ...tree.attributes,
      key: tree.attributes.key,
      expression,
    });
  },
};
