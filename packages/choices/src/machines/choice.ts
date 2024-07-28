import {
  createConditionalMachine,
  createStoryMachine,
  StoryMachine,
  StoryMachineAttributes,
  Condition,
  Sequence,
  Scoped,
  Fallback,
  getFromContext,
  ImmediateSequence,
  ProcessorMachine,
  Running,
  StaticImplements,
  StoryMachineClass,
  StoryMachineRuntime,
  ElementTree,
  Expression,
  Context,
  replaceWithParsedExpressions,
  recursivelyCalculateExpressions,
  addEffectToOutput,
  TextWithExpressions,
} from "@story-machines/core";
import { Choice } from "../types";
import { addChoiceToOutput } from "../utils/add-choice-to-output";
import { CHOICE, CHOSEN_ID, PRESENTED_CHOICE_IDS } from "./constants";
import { createMakeChoiceEffect } from "./make-choice";
import { createPresentChoiceEffect } from "./present-choice";

interface ChoiceAttributes extends StoryMachineAttributes {
  metadata: Record<string, any>;
  text: TextWithExpressions;
  conditions: StoryMachine[];
  children: StoryMachine[];
}

@StaticImplements<StoryMachineClass>()
export class ChoiceMachine extends ProcessorMachine<ChoiceAttributes> {
  machineTypes: symbol[] = [CHOICE];

  static compile(runtime: StoryMachineRuntime, tree: ElementTree) {
    const { children, data } = runtime.compileChildElements(tree.elements);
    const conditions: StoryMachine[] = children.filter(
      (node) => node instanceof Condition
    );

    const nodes = children.filter((node) => !conditions.includes(node));

    const text = new TextWithExpressions(
      data.text ?? tree.attributes.textContent ?? ""
    );
    const metadata = data.metadata ?? {};

    return new ChoiceMachine({
      ...tree.attributes,
      conditions,
      children: nodes,
      text,
      metadata,
    });
  }

  private createBuildChoiceProcessor() {
    return new Scoped({
      child: new Sequence({
        children: [
          ...this.attrs.conditions,
          createStoryMachine((context: Context) => {
            const choice: Choice = {
              id: this.id,
              text: this.attrs.text.evalText(context),
              metadata: recursivelyCalculateExpressions(
                context,
                this.attrs.metadata
              ),
            };

            addChoiceToOutput(context, choice);
            addEffectToOutput(
              context,
              createPresentChoiceEffect({ choiceId: this.id })
            );

            return { status: "Completed" };
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
        ...this.attrs.children,
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
            ...this.attrs.children,
            createStoryMachine((context: Context) => {
              addEffectToOutput(
                context,
                createMakeChoiceEffect({ choiceId: this.id })
              );
              return { status: "Completed" };
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
