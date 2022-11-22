import { Context, ElementTree, Result } from "../../types";
import { Expression, ExpressionParser } from "../../utils/expression-parser";
import { updateContext } from "../../utils/scope";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineClass,
} from "../../base-classes";
import { createDevErrorEffect } from "../effects";
import { STATE } from "./constants";
import { addEffectToOutput } from "../../utils/effects";
import { StaticImplements } from "../../utils/static-implements";
import { StoryMachineRuntime } from "../../runtime";

interface SetStateAttributes extends StoryMachineAttributes {
  key: string;
  expression: Expression;
}

@StaticImplements<StoryMachineClass>()
export class SetState extends StoryMachine<SetStateAttributes> {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { key, textContent } = tree.attributes;
    const expression = ExpressionParser.tryParse(textContent);
    return new SetState({ ...tree.attributes, key, expression });
  }

  process(context: Context): Result {
    const { key, expression } = this.attrs;
    const val = expression.calc(context);

    try {
      updateContext(context, `${STATE}.${key}`, val, 2);
    } catch (e) {
      addEffectToOutput(
        context,
        createDevErrorEffect({
          message: `The provided key does not exist in state: ${key}`,
        })
      );
      return { status: "Terminated" };
    }

    return { status: "Completed" };
  }
}
