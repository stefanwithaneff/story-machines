import { getOutputBuilder } from "../../utils/output-builder";
import { getFromScope } from "../../utils/scope";
import { Context, Result, Effect } from "../../types";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { createDevWarnEffect } from "../effects/dev-warn";
import { EFFECT_TYPE, EFFECT_PAYLOAD } from "../effects/constants";

interface AddEffectInternalAttributes extends StoryMachineAttributes {
  effect: Effect;
}

export class AddEffectInternal extends StoryMachine<AddEffectInternalAttributes> {
  process(context: Context): Result {
    const builder = getOutputBuilder(context);
    builder.addEffect(this.attrs.effect);
    return { status: "Completed" };
  }
}

export class AddEffect extends StoryMachine {
  process(context: Context): Result {
    const type = getFromScope(context, EFFECT_TYPE) ?? context[EFFECT_TYPE];
    const payload =
      getFromScope(context, EFFECT_PAYLOAD) ?? context[EFFECT_PAYLOAD];
    const builder = getOutputBuilder(context);

    if (!type || !payload) {
      builder.addEffect(
        createDevWarnEffect({
          message: "Expected effect type and payload to be provided",
        })
      );
      return { status: "Terminated" };
    }

    builder.addEffect({ type, payload });
    return { status: "Completed" };
  }
}

export const AddEffectCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    return new AddEffect({});
  },
};
