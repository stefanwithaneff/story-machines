import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "./base-classes/story-machine";
import { Once } from "./base-machines/once";
import { AddText } from "./base-machines/add-text";
import { Context, Result } from "../types";

interface TextAttributes extends StoryMachineAttributes {
  textContent: string;
}

/**
 * Returns a text output once, equivalent to:
 * <Once>
 *   <SetScope key="displayText" val="Text to display">
 *     <AddText />
 *   </SetScope>
 * </Once>
 */
export class Text extends StoryMachine<TextAttributes> {
  private processor: StoryMachine;

  constructor(attrs: TextAttributes) {
    super(attrs);

    const { textContent } = attrs;

    this.processor = new Once({
      child: new AddText({ textContent }),
    });
  }

  process(context: Context): Result {
    return this.processor.process(context);
  }
}

export const TextCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    return new Once({
      child: new AddText({ textContent: tree.attributes.textContent }),
    });
  },
};
