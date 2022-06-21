import {
  getFromContext,
  Context,
  Result,
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
  createDevWarnEffect,
  addEffectToOutput,
} from "@story-machines/core";
import { addPassageToOutput } from "../utils/add-passage-to-output";
import { PASSAGE_METADATA, PASSAGE_TEXT } from "./constants";
import { Passage } from "../types";

interface AddPassageInternalAttributes extends StoryMachineAttributes {
  passageFn: (context: Context) => Passage;
}

export class AddPassageInternal extends StoryMachine<AddPassageInternalAttributes> {
  process(context: Context): Result {
    const passage = this.attrs.passageFn(context);
    addPassageToOutput(context, passage);
    return { status: "Completed" };
  }
}

export class AddPassage extends StoryMachine {
  process(context: Context): Result {
    const text = getFromContext(context, PASSAGE_TEXT);
    const metadata = getFromContext(context, PASSAGE_METADATA);

    if (!text && !metadata) {
      addEffectToOutput(
        context,
        createDevWarnEffect({
          message: "Expected passage text or metadata to be provided",
        })
      );
      return { status: "Terminated" };
    }

    addPassageToOutput(context, { text, metadata: metadata ?? {} });
    return { status: "Completed" };
  }
}

export const AddPassageCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    return new AddPassage({ ...tree.attributes });
  },
};
