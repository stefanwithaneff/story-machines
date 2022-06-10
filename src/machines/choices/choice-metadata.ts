import { Context, Result } from "../../types";
import { initScope } from "../../utils/scope";
import { CompositeMachineAttributes } from "../base-classes/composite-machine";
import { StoryMachineCompiler } from "../base-classes/story-machine";
import { ChoiceBuilder } from "./choice-builder";

export class ChoiceMetadata extends ChoiceBuilder<CompositeMachineAttributes> {
  process(context: Context): Result {
    try {
      const key = "choiceMetadata";
      initScope(context, key, {});
      initScope(context, "metadataPrefix", [key]);
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

export const ChoiceMetadataCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);

    return new ChoiceMetadata({ children });
  },
};
