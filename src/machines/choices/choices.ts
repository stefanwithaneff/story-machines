import { StoryMachineRuntime } from "../../runtime";
import { Context, Effect, HandlerMap, Result, SaveData } from "../../types";
import { createStoryMachine } from "../../utils/create-story-machine";
import { handleEffects } from "../../utils/effects";
import { getFromScope, initScope, setOnScope } from "../../utils/scope";
import { CompositeMachineAttributes } from "../base-classes/composite-machine";
import { ProcessorMachine } from "../base-classes/processor-machine";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { ImmediateSelector } from "../base-machines/immediate-selector";
import { InitScopeInternal } from "../base-machines/init-scope";
import { Scoped } from "../base-machines/scoped";
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
          new InitScopeInternal({
            key: CHOSEN_ID,
            getter: () => this.chosenId,
          }),
          new ImmediateSelector({
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

  load(saveData: SaveData, runtime: StoryMachineRuntime) {
    const { chosenId } = saveData[this.id];
    this.chosenId = chosenId;
    this.processor.load(saveData, runtime);
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
