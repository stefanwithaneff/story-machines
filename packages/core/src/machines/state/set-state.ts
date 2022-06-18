import { Context, Result } from "../../types";
import { Expression, ExpressionParser } from "../../utils/expression-parser";
import { getFromContext, updateContext } from "../../utils/scope";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../../base-classes";
import { createDevErrorEffect } from "../effects";
import { CAN_ALTER_STATE, STATE } from "./constants";
import { addEffectToOutput } from "../../utils/effects";

interface SetStateAttributes extends StoryMachineAttributes {
  key: string;
  expression: Expression;
}

export class SetState extends StoryMachine<SetStateAttributes> {
  process(context: Context): Result {
    const { key, expression } = this.attrs;

    const canAlterState = getFromContext(context, CAN_ALTER_STATE);

    if (!canAlterState) {
      addEffectToOutput(
        context,
        createDevErrorEffect({
          message: `Attempted to alter state outside of an Effect handler. Key: ${key}`,
        })
      );
      return { status: "Terminated" };
    }

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

export const SetStateCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const { key, textContent } = tree.attributes;
    const expression = ExpressionParser.tryParse(textContent);
    return new SetState({ ...tree.attributes, key, expression });
  },
};
