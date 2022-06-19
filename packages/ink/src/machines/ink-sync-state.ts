import {
  Context,
  Result,
  Expression,
  ExpressionParser,
  getFromContext,
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "@story-machines/core";
import { Story } from "inkjs/engine/Story";

import { INK_PREPROCESSER, INK_STORY } from "./constants";

interface InkSyncStateAttributes extends StoryMachineAttributes {
  key: string;
  expression: Expression;
}

export class InkSyncState extends StoryMachine<InkSyncStateAttributes> {
  machineTypes: symbol[] = [INK_PREPROCESSER];
  process(context: Context): Result {
    const story: Story | null = getFromContext(context, INK_STORY);
    const value = this.attrs.expression.calc(context);

    if (story) {
      story.state.variablesState.$(this.attrs.key, value);
      return { status: "Completed" };
    }

    return { status: "Terminated" };
  }
}

export const InkSyncStateCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const expression = ExpressionParser.tryParse(tree.attributes.textContent);
    return new InkSyncState({
      ...tree.attributes,
      key: tree.attributes.key,
      expression,
    });
  },
};
