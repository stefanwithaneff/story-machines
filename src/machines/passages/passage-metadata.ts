import { Context, Result } from "../../types";
import { setOnContext } from "../../utils/scope";
import { CompositeMachine } from "../base-classes/composite-machine";
import { StoryMachineCompiler } from "../base-classes/story-machine";
import { KEY_PREFIX } from "../object-builders/constants";
import { PASSAGE_BUILDER, PASSAGE_METADATA } from "./constants";

export class PassageMetadata extends CompositeMachine {
  machineTypes: symbol[] = [PASSAGE_BUILDER];
  init() {}
  save() {}
  load() {}
  process(context: Context): Result {
    try {
      setOnContext(context, PASSAGE_METADATA, {});
      setOnContext(context, KEY_PREFIX, [PASSAGE_METADATA]);
    } catch (e) {
      return { status: "Terminated" };
    }

    for (const child of this.attrs.children) {
      const result = child.process(context);

      if (result.status === "Terminated") {
        return { status: "Terminated" };
      }
    }

    return { status: "Completed" };
  }
}

export const PassageMetadataCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);

    return new PassageMetadata({ ...tree.attributes, children });
  },
};
