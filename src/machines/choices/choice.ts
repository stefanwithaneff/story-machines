import { Context, Result, SaveData } from "../../types";
import {
  createConditionalMachine,
  createStoryMachine,
} from "../../utils/create-story-machine";
import {
  StoryMachine,
  StoryMachineAttributes,
  StoryMachineCompiler,
} from "../base-classes/story-machine";
import { AddChoice } from "../base-machines/add-choice";
import { Condition } from "../base-machines/condition";
import { Sequence } from "../base-machines/sequence";
import { SetContext } from "../base-machines/set-context";
import { Scoped } from "../base-machines/scoped";
import { CHOICE_BUILDER, CHOICE_ID, CHOSEN_ID } from "./constants";
import { isOfType } from "../../utils/tree-utils";
import { getOutputBuilder } from "../../utils/output-builder";
import { createMakeChoiceEffect } from "./make-choice";
import { Selector } from "../base-machines/selector";
import { getFromScope } from "../../utils/scope";
import { ImmediateSequence } from "../base-machines/immediate-sequence";
import { ProcessorMachine } from "../base-classes/processor-machine";
import { SetScopeInternal } from "../base-machines/set-scope";

interface ChoiceAttributes extends StoryMachineAttributes {
  builders: StoryMachine[];
  conditions: StoryMachine[];
  nodes: StoryMachine[];
}

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
  private createAlreadyChosenProcessor() {
    // If the chosen ID provided by a parent matches this Choice,
    // delete the chosen ID from context and process the child nodes
    return new Sequence({
      children: [
        createConditionalMachine(
          (context) => getFromScope(context, CHOSEN_ID) === this.id
        ),
        new SetScopeInternal({ key: CHOSEN_ID, val: null }),
        ...this.attrs.nodes,
      ],
    });
  }
  private createNotYetChosenProcessor() {
    // If the chosen ID does not match and is null,
    // build the choice if we haven't presented it already and wait for it to be selected
    return new Sequence({
      children: [
        createConditionalMachine(
          (context) => getFromScope(context, CHOSEN_ID) === null
        ),
        new Selector({
          children: [
            createConditionalMachine(() => this.presented),
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
          context.input = undefined;
          return { status: "Completed" };
        }),
        new ImmediateSequence({
          children: [
            ...this.attrs.nodes,
            createStoryMachine((context) => {
              const builder = getOutputBuilder(context);
              builder.addEffect(createMakeChoiceEffect({ choiceId: this.id }));
              return { status: "Completed" };
            }),
          ],
        }),
      ],
    });
  }

  protected createProcessor() {
    return new Selector({
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

    return new Choice({ ...tree.attributes, builders, conditions, nodes });
  },
};

function isChoiceBuilder(node: StoryMachine): boolean {
  return isOfType(node, CHOICE_BUILDER);
}
