import { StoryMachineRuntime } from "../../runtime";
import { Context, Effect, HandlerMap, Result, SaveData } from "../../types";
import { createStoryMachine } from "../../utils/create-story-machine";
import { handleEffects } from "../../utils/effects";
import { getFromContext, setOnContext } from "../../utils/scope";
import { CompositeMachineAttributes } from "../base-classes/composite-machine";
import { ProcessorMachine } from "../base-classes/processor-machine";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { ImmediateFallback } from "../base-machines/immediate-fallback";
import { SetContextInternal } from "../context/set-context";
import { Scoped } from "../context/scoped";
import { Sequence } from "../base-machines/sequence";
import { CHOSEN_ID } from "./constants";
import { isMakeChoiceEffect, MAKE_CHOICE } from "./make-choice";

export class Choices extends ProcessorMachine<CompositeMachineAttributes> {
  private chosenId: string | undefined;
  private handlers: HandlerMap = {
    [MAKE_CHOICE]: (_, effect: Effect) => {
      if (isMakeChoiceEffect(effect)) {
        this.chosenId = effect.payload.choiceId;
      }
      return [];
    },
  };

  protected createProcessor(): StoryMachine<StoryMachineAttributes> {
    return new Scoped({
      child: new Sequence({
        children: [
          new SetContextInternal({
            key: CHOSEN_ID,
            valFn: () => this.chosenId,
          }),
          new ImmediateFallback({
            children: this.attrs.children,
          }),
        ],
      }),
    });
  }

  init() {
    this.chosenId = undefined;
    this.processor.init();
  }

  save(saveData: SaveData) {
    if (this.chosenId) {
      saveData[this.id] = {
        chosenId: this.chosenId,
      };
    }
    this.processor.save(saveData);
  }

  load(saveData: SaveData) {
    const { chosenId } = saveData[this.id];
    this.chosenId = chosenId;
    this.processor.load(saveData);
  }

  process(context: Context): Result {
    const result = this.processor.process(context);
    handleEffects(context, this.handlers);
    return result;
  }
}

export const ChoicesCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);

    return new Choices({ children });
  },
};
