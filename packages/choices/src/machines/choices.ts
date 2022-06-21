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
    const data = saveData[this.id];
    this.chosenId = data?.chosenId;
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
