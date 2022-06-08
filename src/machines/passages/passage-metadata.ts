import { Context, Result } from "../../types";
import { CompositeMachineAttributes } from "../base-classes/composite-machine";
import { StoryMachineCompiler } from "../base-classes/story-machine";
import { setOnScope } from "../base-machines/scoped";
import { PassageBuilder } from "./passage-builder";

export class PassageMetadata extends PassageBuilder<CompositeMachineAttributes> {
  process(context: Context): Result {
    try {
      const key = "passageMetadata";
      setOnScope(context, key, {});
      setOnScope(context, "metadataPrefix", [key]);
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
