import { StoryMachineCompiler } from "./base-classes/story-machine";
import { Once } from "./base-machines/once";
import { AddText } from "./base-machines/add-text";

export const TextCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    return new Once({
      child: new AddText({ textContent: tree.attributes.textContent }),
    });
  },
};
