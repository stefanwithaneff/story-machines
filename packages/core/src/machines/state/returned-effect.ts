import { Context, Effect, Result } from "../../types";
import { getFromContext, setOnContext } from "../../utils/scope";
import {
  CompositeMachine,
  CompositeMachineAttributes,
  StoryMachineCompiler,
} from "../../base-classes";
import { KEY_PREFIX } from "../object-builders";
import { RETURNED_EFFECTS } from "./constants";

interface ReturnedEffectAttributes extends CompositeMachineAttributes {
  type: string;
}

export class ReturnedEffect extends CompositeMachine<ReturnedEffectAttributes> {
  process(context: Context): Result {
    const { type } = this.attrs;

    const returnedEffects: Effect[] = getFromContext(context, RETURNED_EFFECTS);
    const keyPrefix = [RETURNED_EFFECTS, returnedEffects.length, "payload"];
    setOnContext(context, KEY_PREFIX, keyPrefix);

    returnedEffects.push({ type, payload: {} });

    for (const child of this.children) {
      const result = child.process(context);

      if (result.status === "Terminated") {
        return result;
      }
    }

    return { status: "Completed" };
  }
}

export const ReturnedEffectCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);

    return new ReturnedEffect({
      ...tree.attributes,
      type: tree.attributes.type,
      children,
    });
  },
};
