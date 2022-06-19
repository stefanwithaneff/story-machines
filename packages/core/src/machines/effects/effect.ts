import { Context } from "../../types";
import { createStoryMachine } from "../../utils/create-story-machine";
import { setOnContext } from "../../utils/scope";
import {
  CompositeMachineAttributes,
  ProcessorMachine,
  StoryMachineCompiler,
} from "../../base-classes";
import { AddEffect } from "./add-effect";
import { Once } from "../once";
import { Scoped } from "../context";
import { Sequence } from "../sequence";
import { KEY_PREFIX } from "../object-builders";
import { EFFECT_PAYLOAD, EFFECT_TYPE } from "./constants";

interface EffectAttributes extends CompositeMachineAttributes {
  type: string;
}

// Naming it "EffectMachine" rather than "Effect" to avoid collision with the Effect type
export class EffectMachine extends ProcessorMachine<EffectAttributes> {
  protected createProcessor() {
    return new Once({
      id: this.generateId("once"),
      child: new Scoped({
        child: new Sequence({
          children: [
            createStoryMachine((context: Context) => {
              setOnContext(context, EFFECT_TYPE, this.attrs.type);
              setOnContext(context, EFFECT_PAYLOAD, {});
              setOnContext(context, KEY_PREFIX, [EFFECT_PAYLOAD]);
              return { status: "Completed" };
            }),
            ...this.attrs.children,
            new AddEffect({}),
          ],
        }),
      }),
    });
  }
}

export const EffectCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);
    return new EffectMachine({
      ...tree.attributes,
      type: tree.attributes.type,
      children,
    });
  },
};
