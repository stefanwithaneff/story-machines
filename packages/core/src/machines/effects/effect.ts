import { Context, Effect, ElementTree } from "../../types";
import { createStoryMachine } from "../../utils/create-story-machine";
import {
  ProcessorMachine,
  StoryMachineAttributes,
  StoryMachineClass,
} from "../../base-classes";
import { Once } from "../once";
import { StaticImplements } from "../../utils/static-implements";
import { StoryMachineRuntime } from "../../runtime";
import { addEffectToOutput } from "../../utils/effects";
import { recursivelyCalculateExpressions } from "../../utils/expression-parser";

interface EffectAttributes extends StoryMachineAttributes {
  type: string;
  data: Record<string, any>;
}

// Naming it "EffectMachine" rather than "Effect" to avoid collision with the Effect type
@StaticImplements<StoryMachineClass>()
export class EffectMachine extends ProcessorMachine<EffectAttributes> {
  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { data } = runtime.compileChildElements(tree.elements);
    return new EffectMachine({
      ...tree.attributes,
      type: tree.attributes.type,
      data,
    });
  }

  protected createProcessor() {
    return new Once({
      id: this.generateId("once"),
      child: createStoryMachine((context: Context) => {
        if (!this.attrs.type) {
          return { status: "Terminated" };
        }
        const effect: Effect = {
          type: this.attrs.type,
          payload: recursivelyCalculateExpressions(context, this.attrs.data),
        };
        addEffectToOutput(context, effect);
        return { status: "Completed" };
      }),
    });
  }
}
