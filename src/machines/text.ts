import {
  StoryMachine,
  StoryMachineAttributes,
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

    this.processor = new Once({
      child: new AddText({ text: this.attrs.textContent }),
    });
  }

  process(context: Context): Result {
    return this.processor.process(context);
  }
}
