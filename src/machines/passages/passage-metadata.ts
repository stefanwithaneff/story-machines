import { Context, Result } from "../../types";
import { initScope } from "../../utils/scope";
import { CompositeMachineAttributes } from "../base-classes/composite-machine";
import { StoryMachineCompiler } from "../base-classes/story-machine";
import { KEY_PREFIX } from "../object-builders/constants";
import { PASSAGE_METADATA } from "./constants";
import { PassageBuilder } from "./passage-builder";

export class PassageMetadata extends PassageBuilder<CompositeMachineAttributes> {
  process(context: Context): Result {
    try {
      initScope(context, PASSAGE_METADATA, {});
      initScope(context, KEY_PREFIX, [PASSAGE_METADATA]);
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

    return new PassageMetadata({ children });
  },
};
