import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { Context, Result } from "../../types";
import { initScope } from "../../utils/scope";

export interface InitScopeAttributes extends StoryMachineAttributes {
  key: string;
  val: any;
}

export class InitScope extends StoryMachine<InitScopeAttributes> {
  process(context: Context): Result {
    try {
      initScope(context, this.attrs.key, this.attrs.val);
    } catch (e) {
      return { status: "Terminated" };
    }

    return { status: "Completed" };
  }
}

export const InitScopeCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const { key, val } = tree.attributes;
    return new InitScope({ key, val });
  },
};
