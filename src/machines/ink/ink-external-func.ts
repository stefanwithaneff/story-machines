import { Context, Result } from "../../types";
import { Expression, ExpressionParser } from "../../utils/expression-parser";
import { getFromContext, setOnContext } from "../../utils/scope";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { INK_EXTERNAL_FUNCS, INK_INITIALIZER } from "./constants";

interface InkExternalFuncAttributes extends StoryMachineAttributes {
  name: string;
  isGeneral: boolean;
  expression: Expression;
}

export class InkExternalFunc extends StoryMachine<InkExternalFuncAttributes> {
  machineTypes: symbol[] = [INK_INITIALIZER];
  init() {}
  save() {}
  load() {}
  process(context: Context): Result {
    const func = this.attrs.expression.calc(context);
    if (typeof func !== "function") {
      return { status: "Terminated" };
    }

    const externalFuncList = getFromContext(context, INK_EXTERNAL_FUNCS);

    if (externalFuncList === null) {
      setOnContext(context, INK_EXTERNAL_FUNCS, [func]);
    } else {
      externalFuncList.push(func);
    }
    return { status: "Completed" };
  }
}

export const InkExternalFuncCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const name = tree.attributes.name;
    const expression = ExpressionParser.tryParse(tree.attributes.textContent);
    const isGeneral = tree.attributes.isGeneral === "true";
    return new InkExternalFunc({
      ...tree.attributes,
      name,
      expression,
      isGeneral,
    });
  },
};
