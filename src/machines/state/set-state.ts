import { Context, Result } from "../../types";
import { Expression, ExpressionParser } from "../../utils/expression-parser";
import { getOutputBuilder } from "../../utils/output-builder";
import { getFromContext, setOnContext, updateContext } from "../../utils/scope";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { createDevErrorEffect } from "../effects/dev-error";
import { CAN_ALTER_STATE, STATE } from "./constants";

interface SetStateAttributes extends StoryMachineAttributes {
  key: string;
  expression: Expression;
}

export class SetState extends StoryMachine<SetStateAttributes> {
  process(context: Context): Result {
    const { key, expression } = this.attrs;
    const builder = getOutputBuilder(context);

    const canAlterState = getFromContext(context, CAN_ALTER_STATE);

    if (!canAlterState) {
      builder.addEffect(
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
      builder.addEffect(
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
