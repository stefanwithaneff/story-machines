import {
  Context,
  Effect,
  HandlerMap,
  Result,
  SaveData,
  handleEffects,
  CompositeMachineAttributes,
  ProcessorMachine,
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
  ImmediateFallback,
  SetContextInternal,
  Scoped,
  Sequence,
} from "@story-machines/core";
import { CHOSEN_ID, PRESENTED_CHOICE_IDS } from "./constants";
import { isMakeChoiceEffect, MAKE_CHOICE } from "./make-choice";
import { isPresentChoiceEffect, PRESENT_CHOICE } from "./present-choice";

export class Choices extends ProcessorMachine<CompositeMachineAttributes> {
  private chosenId: string | null = null;
  private presentedChoices: string[] | null = null;
  private handlers: HandlerMap = {
    [MAKE_CHOICE]: (_, effect: Effect) => {
      if (isMakeChoiceEffect(effect)) {
        this.chosenId = effect.payload.choiceId;
      }
      return [];
    },
    [PRESENT_CHOICE]: (_, effect: Effect) => {
      if (isPresentChoiceEffect(effect)) {
        if (this.presentedChoices === null) {
          this.presentedChoices = [];
        }
        this.presentedChoices.push(effect.payload.choiceId);
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
          new SetContextInternal({
            key: PRESENTED_CHOICE_IDS,
            valFn: () => this.presentedChoices,
          }),
          new ImmediateFallback({
            children: this.attrs.children,
          }),
        ],
      }),
    });
  }

  init() {
    this.chosenId = null;
    this.presentedChoices = null;
    this.processor.init();
  }

  save(saveData: SaveData) {
    saveData[this.id] = {
      chosenId: this.chosenId,
      presentedChoices: this.presentedChoices,
    };
    this.processor.save(saveData);
  }

  load(saveData: SaveData) {
    const data = saveData[this.id];
    this.chosenId = data?.chosenId ?? null;
    this.presentedChoices = data?.presentedChoices ?? null;
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

    return new Choices({ ...tree.attributes, children });
  },
};
