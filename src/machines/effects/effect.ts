import { Context } from "../../types";
import { createStoryMachine } from "../../utils/create-story-machine";
import { initScope } from "../../utils/scope";
import { CompositeMachineAttributes } from "../base-classes/composite-machine";
import { ProcessorMachine } from "../base-classes/processor-machine";
import { StoryMachineCompiler } from "../base-classes/story-machine";
import { AddEffect } from "../base-machines/add-effect";
import { Once } from "../base-machines/once";
import { Scoped } from "../base-machines/scoped";
import { Sequence } from "../base-machines/sequence";
import { KEY_PREFIX } from "../object-builders/constants";
import { EFFECT_PAYLOAD, EFFECT_TYPE } from "./constants";

interface EffectAttributes extends CompositeMachineAttributes {
  type: string;
}

export class Effect extends ProcessorMachine<EffectAttributes> {
  protected createProcessor() {
    return new Once({
      id: `once_${this.id}`,
      child: new Scoped({
        child: new Sequence({
          children: [
            createStoryMachine((context: Context) => {
              try {
                initScope(context, EFFECT_TYPE, this.attrs.type);
                initScope(context, EFFECT_PAYLOAD, {});
                initScope(context, KEY_PREFIX, [EFFECT_PAYLOAD]);
              } catch (e) {
                return { status: "Terminated" };
              }
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
    return new Effect({
      ...tree.attributes,
      type: tree.attributes.type,
      children,
    });
  },
};
