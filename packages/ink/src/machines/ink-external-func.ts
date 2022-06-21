import {
  Context,
  Result,
  Expression,
  ExpressionParser,
  getFromContext,
  setOnContext,
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "@story-machines/core";
import {
  InkExternalFunction,
  INK_EXTERNAL_FUNCS,
  INK_INITIALIZER,
} from "./constants";

interface InkExternalFuncAttributes extends StoryMachineAttributes {
  name: string;
  isGeneral: boolean;
  expression: Expression;
}

export class InkExternalFunc extends StoryMachine<InkExternalFuncAttributes> {
  machineTypes: symbol[] = [INK_INITIALIZER];
  process(context: Context): Result {
    const func = this.attrs.expression.calc(context);
    if (typeof func !== "function") {
      return { status: "Terminated" };
    }

    const externalFuncList = getFromContext(context, INK_EXTERNAL_FUNCS);
    const externalFunc: InkExternalFunction = {
      fn: func,
      name: this.attrs.name,
      isGeneral: this.attrs.isGeneral,
    };

    if (externalFuncList === null) {
      setOnContext(context, INK_EXTERNAL_FUNCS, [externalFunc]);
    } else {
      externalFuncList.push(externalFunc);
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
