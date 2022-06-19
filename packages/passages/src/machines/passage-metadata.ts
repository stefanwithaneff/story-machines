import {
  Context,
  Result,
  setOnContext,
  CompositeMachine,
  StoryMachineCompiler,
  KEY_PREFIX,
} from "@story-machines/core";
import { PASSAGE_BUILDER, PASSAGE_METADATA } from "./constants";

export class PassageMetadata extends CompositeMachine {
  machineTypes: symbol[] = [PASSAGE_BUILDER];
  process(context: Context): Result {
    setOnContext(context, PASSAGE_METADATA, {});
    setOnContext(context, KEY_PREFIX, [PASSAGE_METADATA]);

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
