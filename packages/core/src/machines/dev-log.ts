import { Context, Result } from "../types";
import {
  Expression,
  parseAll,
  replaceWithParsedExpressions,
} from "../utils/expression-parser";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes";

interface DevLogAttributes extends StoryMachineAttributes {
  expressions: Expression[];
}

export class DevLog extends StoryMachine<DevLogAttributes> {
  process(context: Context): Result {
    const evalText = replaceWithParsedExpressions(
      context,
      this.attrs.expressions,
      this.attrs.textContent ?? ""
    );
    console.log(evalText);
    return { status: "Completed" };
  }
}

export const DevLogCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const expressions: Expression[] = parseAll(tree.attributes.textContent);

    return new DevLog({ ...tree.attributes, expressions });
  },
};
