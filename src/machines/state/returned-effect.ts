import { Context, Effect, Result } from "../../types";
import { getFromScope, initScope } from "../../utils/scope";
import {
  CompositeMachine,
  CompositeMachineAttributes,
} from "../base-classes/composite-machine";
import { StoryMachineCompiler } from "../base-classes/story-machine";
import { KEY_PREFIX } from "../object-builders/constants";
import { RETURNED_EFFECTS } from "./constants";

interface ReturnedEffectAttributes extends CompositeMachineAttributes {
  type: string;
}

export class ReturnedEffect extends CompositeMachine<ReturnedEffectAttributes> {
  process(context: Context): Result {
    const { type } = this.attrs;

    let returnedEffects: Effect[] =
      getFromScope(context, RETURNED_EFFECTS) ?? context[RETURNED_EFFECTS];
    try {
      if (!returnedEffects) {
        returnedEffects = [];
        initScope(context, RETURNED_EFFECTS, returnedEffects);
      }
      const keyPrefix = [RETURNED_EFFECTS, returnedEffects.length, "payload"];
      initScope(context, KEY_PREFIX, keyPrefix);
    } catch (e) {
      return { status: "Terminated" };
    }

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
