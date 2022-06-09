import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { Context, Result } from "../../types";
import { setOnScope } from "../../utils/scope";

export interface SetScopeAttributes extends StoryMachineAttributes {
  key: string;
  val: any;
}

export class SetScope extends StoryMachine<SetScopeAttributes> {
  process(context: Context): Result {
    try {
      setOnScope(context, this.attrs.key, this.attrs.val);
    } catch (e) {
      return { status: "Terminated" };
    }

    return { status: "Completed" };
  }
}

export const SetScopeCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const { key, val } = tree.attributes;
    return new SetScope({ key, val });
  },
};
