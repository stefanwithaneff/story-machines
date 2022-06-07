import { set } from "lodash";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { Context, Result } from "../../types";

export interface SetContextAttributes extends StoryMachineAttributes {
  key: string;
  val: any;
}

export class SetContext extends StoryMachine<SetContextAttributes> {
  process(context: Context): Result {
    set(context, this.attrs.key, this.attrs.val);
    return { status: "Completed" };
  }
}

export const SetContextCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const { key, val } = tree.attributes;
    return new SetContext({ key, val });
  },
};
