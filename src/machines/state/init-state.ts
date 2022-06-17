import { Context, Result } from "../../types";
import { setOnContext } from "../../utils/scope";
import { CompositeMachine } from "../base-classes/composite-machine";
import { StoryMachineCompiler } from "../base-classes/story-machine";
import { KEY_PREFIX } from "../object-builders/constants";
import { INITIAL_STATE, STATE_BUILDER } from "./constants";

export class InitState extends CompositeMachine {
  machineTypes = [STATE_BUILDER];
  process(context: Context): Result {
    const state = {};
    setOnContext(context, INITIAL_STATE, state);
    setOnContext(context, KEY_PREFIX, [INITIAL_STATE]);

    for (const child of this.children) {
      const result = child.process(context);

      if (result.status === "Terminated") {
        return result;
      }
    }

    return { status: "Completed" };
  }
}

export const InitStateCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);
    return new InitState({ ...tree.attributes, children });
  },
};
