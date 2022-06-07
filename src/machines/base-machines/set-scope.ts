import { set } from "lodash";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { Result } from "../../types";
import { ScopedContext } from "./scoped";

export interface SetScopeAttributes extends StoryMachineAttributes {
  key: string;
  val: any;
}

export class SetScope extends StoryMachine<SetScopeAttributes> {
  process(context: ScopedContext): Result {
    if (!context.__SCOPES__ || context.__SCOPES__.length < 1) {
      return { status: "Terminated" };
    }

    const currentScope = context.__SCOPES__[0];

    set(currentScope.scope, this.attrs.key, this.attrs.val);

    return { status: "Completed" };
  }
}

export const SetScopeCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const { key, val } = tree.attributes;
    return new SetScope({ key, val });
  },
};
