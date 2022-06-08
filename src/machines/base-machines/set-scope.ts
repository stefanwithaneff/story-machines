import { set } from "lodash";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { Result } from "../../types";
import { ScopedContext, setOnScope } from "./scoped";

export interface SetScopeAttributes extends StoryMachineAttributes {
  key: string;
  val: any;
}

export class SetScope extends StoryMachine<SetScopeAttributes> {
  process(context: ScopedContext): Result {
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
