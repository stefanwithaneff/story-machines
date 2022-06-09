import { getOutputBuilder } from "../../utils/output-builder";
import { getFromScope } from "../../utils/scope";
import { Context, Result, Passage } from "../../types";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { createDevWarnEffect } from "../effects/dev-warn";

interface AddPassageInternalAttributes extends StoryMachineAttributes {
  passage: Passage;
}

export class AddPassageInternal extends StoryMachine<AddPassageInternalAttributes> {
  process(context: Context): Result {
    const builder = getOutputBuilder(context);
    builder.addPassage(this.attrs.passage);
    return { status: "Completed" };
  }
}

export class AddPassage extends StoryMachine {
  process(context: Context): Result {
    const text = getFromScope(context, "passageText") ?? context.passageText;
    const metadata =
      getFromScope(context, "passageMetadata") ?? context.passageMetadata;
    const builder = getOutputBuilder(context);

    if (!text && !metadata) {
      builder.addEffect(
        createDevWarnEffect({
          message: "Expected passage text or metadata to be provided",
        })
      );
      return { status: "Terminated" };
    }

    builder.addPassage({ text, metadata });
    return { status: "Completed" };
  }
}

export const AddPassageCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    return new AddPassage({});
  },
};
