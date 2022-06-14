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
import { StoryMachineRuntime } from "../../runtime";
import { ImmediateSequence } from "../base-machines/immediate-sequence";

interface ChoiceAttributes extends StoryMachineAttributes {
  builders: StoryMachine[];
  conditions: StoryMachine[];
  nodes: StoryMachine[];
}

export class Choice extends StoryMachine<ChoiceAttributes> {
  private presented: boolean = false;
  private nodesProcessor: StoryMachine;
  private builderProcessor: StoryMachine;

  constructor(attrs: ChoiceAttributes) {
    super(attrs);
    this.nodesProcessor = this.createNodesProcessor();
    this.builderProcessor = this.createBuilderProcessor();
  }

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
  private createNodesProcessor() {
    return new Sequence({ children: this.attrs.nodes });
  }
  private createBuilderProcessor() {
    return new Sequence({
      children: [
        new Selector({
          children: [
            createConditionalMachine(() => this.presented),
            this.createBuildChoiceProcessor(),
          ],
        }),
        createStoryMachine((context) => {
          // If the choice has not been selected yet, keep checking for matchine input
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

  init() {
    this.presented = false;
    this.nodesProcessor.init();
    this.builderProcessor.init();
  }

  save(saveData: SaveData) {
    this.nodesProcessor.save(saveData);
  }

  load(saveData: SaveData, runtime: StoryMachineRuntime) {
    this.nodesProcessor.load(saveData, runtime);
  }

  process(context: Context): Result {
    const chosenId: string | null = getFromScope(context, CHOSEN_ID);
    if (chosenId === this.id) {
      return this.nodesProcessor.process(context);
    }

    if (chosenId !== null) {
      return { status: "Terminated" };
    }

    return this.builderProcessor.process(context);
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
