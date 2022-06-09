import { Context, Result } from "../../types";
import { Expression, ExpressionParser } from "../../utils/expression-parser";
import { getFromScope, setOnScope } from "../../utils/scope";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";

interface MetadataValueAttributes extends StoryMachineAttributes {
  key?: string;
  expression: Expression;
}

export class MetadataValue extends StoryMachine<MetadataValueAttributes> {
  process(context: Context): Result {
    const val = this.attrs.expression.calc(context);
    const metadataPrefix: string[] = getFromScope(context, "metadataPrefix");

    if (!metadataPrefix) {
      return { status: "Terminated" };
    }

    const keyPath: string[] = this.attrs.key
      ? [...metadataPrefix, this.attrs.key]
      : metadataPrefix;

    try {
      setOnScope(context, keyPath, val);
    } catch (e) {
      return { status: "Terminated" };
    }

    return { status: "Completed" };
  }
}

export const MetadataValueCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const expression = ExpressionParser.tryParse(tree.attributes.textContent);
    return new MetadataValue({ expression, key: tree.attributes.key });
  },
};
