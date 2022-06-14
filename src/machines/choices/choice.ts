import { Context } from "../../types";
import { createStoryMachine } from "../../utils/create-story-machine";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { AddChoice } from "../base-machines/add-choice";
import { Condition } from "../base-machines/condition";
import { Sequence } from "../base-machines/sequence";
import { MemorySequence } from "../base-machines/memory-sequence";
import { SetContext } from "../base-machines/set-context";
import { Wait } from "../base-machines/wait";
import { Scoped } from "../base-machines/scoped";
import { CHOICE_BUILDER, CHOICE_ID, CHOSEN_ID } from "./constants";
import { isOfType } from "../../utils/tree-utils";
import { ProcessorMachine } from "../base-classes/processor-machine";
import { getOutputBuilder } from "../../utils/output-builder";
import { createMakeChoiceEffect } from "./make-choice";
import { Selector } from "../base-machines/selector";
import { getFromScope } from "../../utils/scope";
import { SetScopeInternal } from "../base-machines/set-scope";

interface ChoiceAttributes extends StoryMachineAttributes {
  builders: StoryMachine[];
  conditions: StoryMachine[];
  nodes: StoryMachine[];
}

// TODO: Remove stateful elements from Choice and elevate it to Choices using a Selector + Condition combo
// TODO: Figure out how to clean it up to look better
export class Choice extends ProcessorMachine<ChoiceAttributes> {
  private presented: boolean = false;

  private createBuildChoiceProcessor() {
    return new Scoped({
      child: new Sequence({
        children: [
          ...this.attrs.conditions,
          new SetContext({
            key: CHOICE_ID,
            val: this.id,
          }),
          ...this.attrs.builders,
          new AddChoice({}),
          createStoryMachine((_) => {
            this.presented = true;
            return { status: "Running" };
          }),
        ],
      }),
    });
  }
  protected createProcessor() {
    const { builders, conditions, nodes } = this.attrs;
    return new Sequence({
      children: [
        new Selector({
          children: [
            // If chosenId is set by a parent element and it matches this choice, run the children
            new Sequence({
              children: [
                createStoryMachine((context) => {
                  const chosenId = getFromScope(context, CHOSEN_ID);
                  if (chosenId && chosenId === this.id) {
                    return { status: "Completed" };
                  }
                  return { status: "Terminated" };
                }),
                new SetScopeInternal({ key: CHOSEN_ID, val: null }),
              ],
            }),
            // If chosenId is NULL and the choice has not been presented, present the choices and wait til next tick
            new Sequence({
              children: [
                createStoryMachine((context) => {
                  const chosenId = getFromScope(context, CHOSEN_ID);
                  if (chosenId) {
                    return { status: "Terminated" };
                  }
                  if (!this.presented) {
                    return { status: "Completed" };
                  }

                  // If the choice has not been selected yet, keep checking for matching input
                  const { input } = context;
                  if (!input || input.type !== "Choice") {
                    return { status: "Running" };
                  }
                  if (input.payload.id !== this.id) {
                    return { status: "Terminated" };
                  }
                  const builder = getOutputBuilder(context);
                  builder.addEffect(
                    createMakeChoiceEffect({ choiceId: this.id })
                  );
                  context.input = undefined;
                  return { status: "Completed" };
                }),
                new Selector({
                  children: [
                    createStoryMachine((context) => {
                      // If the choice has not been presented yet, move on to the choice building step
                      if (this.presented) {
                        return { status: "Completed" };
                      }
                      return { status: "Terminated" };
                    }),
                    this.createBuildChoiceProcessor(),
                  ],
                }),
              ],
            }),
          ],
        }),
        ...nodes,
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

    return new Choice({ ...tree.attributes, builders, conditions, nodes });
  },
};

function isChoiceBuilder(node: StoryMachine): boolean {
  return isOfType(node, CHOICE_BUILDER);
}
