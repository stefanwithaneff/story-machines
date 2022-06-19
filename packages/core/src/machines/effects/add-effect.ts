import { getFromContext } from "../../utils/scope";
import { Context, Result, Effect } from "../../types";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../../base-classes";
import { createDevWarnEffect } from "./dev-warn";
import { EFFECT_TYPE, EFFECT_PAYLOAD } from "./constants";
import { addEffectToOutput } from "../../utils/effects";

interface AddEffectInternalAttributes extends StoryMachineAttributes {
  effectFn: (ctx: Context) => Effect;
}

export class AddEffectInternal extends StoryMachine<AddEffectInternalAttributes> {
  process(context: Context): Result {
    addEffectToOutput(context, this.attrs.effectFn(context));
    return { status: "Completed" };
  }
}

export class AddEffect extends StoryMachine {
  process(context: Context): Result {
    const type = getFromContext(context, EFFECT_TYPE);
    const payload = getFromContext(context, EFFECT_PAYLOAD);

    if (!type || !payload) {
      addEffectToOutput(
        context,
        createDevWarnEffect({
          message: "Expected effect type and payload to be provided",
        })
      );
      return { status: "Terminated" };
    }

    addEffectToOutput(context, { type, payload });
    return { status: "Completed" };
  }
}

export const AddEffectCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    return new AddEffect({ ...tree.attributes });
  },
};
