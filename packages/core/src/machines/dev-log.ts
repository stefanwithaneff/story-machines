import { Context, ElementTree, Result } from "../types";
import {
  Expression,
  parseAll,
  replaceWithParsedExpressions,
} from "../utils/expression-parser";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineClass,
} from "../base-classes";
import { StaticImplements } from "../utils/static-implements";
import { StoryMachineRuntime } from "../runtime";

interface DevLogAttributes extends StoryMachineAttributes {
  expressions: Expression[];
}

@StaticImplements<StoryMachineClass>()
export class DevLog extends StoryMachine<DevLogAttributes> {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const expressions: Expression[] = parseAll(tree.attributes.textContent);
    return new DevLog({ ...tree.attributes, expressions });
  }

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
