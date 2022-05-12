import { StoryMachine, StoryMachineRuntime } from "./story-machine";
import { once } from "./once";
import { addText } from "./add-text";
import { ElementTree, ProcessFn } from "./types";

/**
 * Returns a text output once, equivalent to:
 * <Once>
 *   <SetScope key="displayText" val="Text to display">
 *     <AddText />
 *   </SetScope>
 * </Once>
 */
export class Text extends StoryMachine {
  private text: string;

  constructor(tree: ElementTree) {
    super(tree);

    // TODO: Shore up the definition of text nodes in the element tree
    this.text = tree.attributes.text;
  }

  protected generateProcessFn(): ProcessFn {
    return text(this.text);
  }
}

const text = (text: string) => {
  return once(addText(text));
};

StoryMachineRuntime.registerMachines(Text);
