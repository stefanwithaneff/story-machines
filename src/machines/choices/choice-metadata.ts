import { Context, Result } from "../../types";
import { setOnContext } from "../../utils/scope";
import { CompositeMachine } from "../base-classes/composite-machine";
import { StoryMachineCompiler } from "../base-classes/story-machine";
import { KEY_PREFIX } from "../object-builders/constants";
import { CHOICE_BUILDER, CHOICE_METADATA } from "./constants";

export class ChoiceMetadata extends CompositeMachine {
  machineTypes: symbol[] = [CHOICE_BUILDER];
  process(context: Context): Result {
    setOnContext(context, CHOICE_METADATA, {});
    setOnContext(context, KEY_PREFIX, [CHOICE_METADATA]);

    for (const child of this.attrs.children) {
      const result = child.process(context);

      if (result.status === "Terminated") {
        return { status: "Terminated" };
      }
    }

    return { status: "Completed" };
  }
}

export const ChoiceMetadataCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);

    return new ChoiceMetadata({ ...tree.attributes, children });
  },
};
