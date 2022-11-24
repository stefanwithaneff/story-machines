import {
  Context,
  Effect,
  HandlerMap,
  Result,
  createConditionalMachine,
  handleEffects,
  StoryMachine,
  StoryMachineAttributes,
  getFromContext,
  ProcessorMachine,
  ImmediateFallback,
  Fallback,
  Sequence,
  isOfType,
  StaticImplements,
  StoryMachineClass,
  StoryMachineRuntime,
  ElementTree,
} from "@story-machines/core";
import { CHOICE, CHOSEN_ID } from "./constants";
import {
  createMakeChoiceEffect,
  isMakeChoiceEffect,
  MAKE_CHOICE,
} from "./make-choice";

interface ChoiceGroupAttributes extends StoryMachineAttributes {
  choices: StoryMachine[];
  nodes: StoryMachine[];
}

@StaticImplements<StoryMachineClass>()
export class ChoiceGroup extends ProcessorMachine<ChoiceGroupAttributes> {
  private handlers: HandlerMap = {
    [MAKE_CHOICE]: (_, effect: Effect) => {
      if (isMakeChoiceEffect(effect)) {
        return [createMakeChoiceEffect({ choiceId: this.id })];
      }

      return [];
    },
  };

  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { children } = runtime.compileChildElements(tree.elements);
    const choices = children.filter((child) => isOfType(child, CHOICE));
    const nodes = children.filter((child) => !isOfType(child, CHOICE));

    return new ChoiceGroup({ ...tree.attributes, choices, nodes });
  }

  protected createProcessor() {
    const { choices, nodes } = this.attrs;
    return new Sequence({
      children: [
        new Fallback({
          children: [
            createConditionalMachine(
              (context) => getFromContext(context, CHOSEN_ID) === this.id
            ),
            new ImmediateFallback({ children: choices }),
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
