import {
  createConditionalMachine,
  createStoryMachine,
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
  Condition,
  Sequence,
  SetContextInternal,
  Scoped,
  isOfType,
  Fallback,
  getFromContext,
  ImmediateSequence,
  ProcessorMachine,
  Running,
  AddEffectInternal,
} from "@story-machines/core";
import { AddChoice } from "./add-choice";
import {
  CHOICE,
  CHOICE_BUILDER,
  CHOICE_ID,
  CHOSEN_ID,
  PRESENTED_CHOICE_IDS,
} from "./constants";
import { createMakeChoiceEffect } from "./make-choice";
import { createPresentChoiceEffect } from "./present-choice";

interface ChoiceAttributes extends StoryMachineAttributes {
  builders: StoryMachine[];
  conditions: StoryMachine[];
  nodes: StoryMachine[];
}

export class ChoiceMachine extends ProcessorMachine<ChoiceAttributes> {
  machineTypes: symbol[] = [CHOICE];

  private createBuildChoiceProcessor() {
    return new Scoped({
      child: new Sequence({
        children: [
          ...this.attrs.conditions,
          new SetContextInternal({
            key: CHOICE_ID,
            valFn: () => this.id,
          }),
          ...this.attrs.builders,
          new AddChoice({}),
          new AddEffectInternal({
            effectFn: () => createPresentChoiceEffect({ choiceId: this.id }),
          }),
          new Running({}), // Emit a Running status at the end to wait til next tick for input checking
        ],
      }),
    });
  }
  private createAlreadyChosenProcessor() {
    // If the chosen ID provided by a parent matches this Choice, process the child nodes
    return new Sequence({
      children: [
        createConditionalMachine(
          (context) => getFromContext(context, CHOSEN_ID) === this.id
        ),
        ...this.attrs.nodes,
      ],
    });
  }
  private createNotYetChosenProcessor() {
    // If the chosen ID does not match and is null,
    // build the choice if the choices haven't been presented already and wait until a choice input is provided
    return new Sequence({
      children: [
        createConditionalMachine(
          (context) => getFromContext(context, CHOSEN_ID) === null
        ),
        new Fallback({
          children: [
            createConditionalMachine(
              (context) =>
                getFromContext(context, PRESENTED_CHOICE_IDS) !== null
            ),
            this.createBuildChoiceProcessor(),
          ],
        }),
        createStoryMachine((context) => {
          const { input } = context;
          if (!input || input.type !== "Choice") {
            return { status: "Running" };
          }
          if (input.payload.id !== this.id) {
            return { status: "Terminated" };
          }
          return { status: "Completed" };
        }),
        new ImmediateSequence({
          children: [
            ...this.attrs.nodes,
            new AddEffectInternal({
              effectFn: () => createMakeChoiceEffect({ choiceId: this.id }),
            }),
          ],
        }),
      ],
    });
  }

  protected createProcessor() {
    return new Fallback({
      children: [
        this.createAlreadyChosenProcessor(),
        this.createNotYetChosenProcessor(),
      ],
    });
  }
}

export const ChoiceCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);
    const conditions: StoryMachine[] = children.filter(
      (node) => node instanceof Condition
    );

    const builders = children.filter(isChoiceBuilder);

    const nodes = children.filter(
      (node) => !builders.includes(node) && !conditions.includes(node)
    );

    return new ChoiceMachine({
      ...tree.attributes,
      builders,
      conditions,
      nodes,
    });
  },
};

function isChoiceBuilder(node: StoryMachine): boolean {
  return isOfType(node, CHOICE_BUILDER);
}
