import { getOutputBuilder } from "../../utils/output-builder";
import { getFromContext } from "../../utils/scope";
import { Context, Result, Passage } from "../../types";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { createDevWarnEffect } from "../effects/dev-warn";
import { PASSAGE_METADATA, PASSAGE_TEXT } from "../passages/constants";

interface AddPassageInternalAttributes extends StoryMachineAttributes {
  passage: Passage;
}

export class AddPassageInternal extends StoryMachine<AddPassageInternalAttributes> {
  init() {}
  save() {}
  load() {}
  process(context: Context): Result {
    const builder = getOutputBuilder(context);
    builder.addPassage(this.attrs.passage);
    return { status: "Completed" };
  }
}

export class AddPassage extends StoryMachine {
  init() {}
  save() {}
  load() {}
  process(context: Context): Result {
    const text = getFromContext(context, PASSAGE_TEXT);
    const metadata = getFromContext(context, PASSAGE_METADATA);
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
    return new AddPassage({ ...tree.attributes });
  },
};
