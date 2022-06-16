import { Context, Effect, HandlerMap, Result } from "../../types";
import {
  createConditionalMachine,
  createStoryMachine,
} from "../../utils/create-story-machine";
import { handleEffects } from "../../utils/effects";
import { getFromContext } from "../../utils/scope";
import { ProcessorMachine } from "../base-classes/processor-machine";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { ImmediateSelector } from "../base-machines/immediate-selector";
import { Selector } from "../base-machines/selector";
import { Sequence } from "../base-machines/sequence";
import { SetContextInternal } from "../context/set-context";
import { Choice } from "./choice";
import { CHOSEN_ID } from "./constants";
import {
  createMakeChoiceEffect,
  isMakeChoiceEffect,
  MAKE_CHOICE,
} from "./make-choice";

interface MultiChoiceAttributes extends StoryMachineAttributes {
  choices: StoryMachine[];
  nodes: StoryMachine[];
}

export class MultiChoice extends ProcessorMachine<MultiChoiceAttributes> {
  private handlers: HandlerMap = {
    [MAKE_CHOICE]: (_, effect: Effect) => {
      if (isMakeChoiceEffect(effect)) {
        return [createMakeChoiceEffect({ choiceId: this.id })];
      }

      return [];
    },
  };
  protected createProcessor() {
    const { choices, nodes } = this.attrs;
    return new Sequence({
      children: [
        new Selector({
          children: [
            new Sequence({
              children: [
                createConditionalMachine(
                  (context) => getFromContext(context, CHOSEN_ID) === this.id
                ),
                new SetContextInternal({ key: CHOSEN_ID, valFn: () => null }),
              ],
            }),
            new ImmediateSelector({ children: choices }),
          ],
        }),
        ...nodes,
      ],
    });
  }

  process(context: Context): Result {
    const result = this.processor.process(context);
    handleEffects(context, this.handlers);
    return result;
  }
}

export const MultiChoiceCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);
    const choices = children.filter((child) => child instanceof Choice);
    const nodes = children.filter((child) => !(child instanceof Choice));

    return new MultiChoice({ ...tree.attributes, choices, nodes });
  },
};
