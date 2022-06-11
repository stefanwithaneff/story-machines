import { Context, Result } from "../../types";
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
import { ChoiceBuilder } from "./choice-builder";
import { CHOICE_ID } from "./constants";

interface ChoiceAttributes extends StoryMachineAttributes {
  builders: StoryMachine[];
  conditions: StoryMachine[];
  nodes: StoryMachine[];
}

export class Choice extends StoryMachine<ChoiceAttributes> {
  private processor: StoryMachine;
  constructor(attrs: ChoiceAttributes) {
    super(attrs);

    const { builders, conditions, nodes } = attrs;

    this.processor = new MemorySequence({
      children: [
        // Present Choice to user
        new Scoped({
          child: new Sequence({
            children: [
              ...conditions,
              new SetContext({
                key: CHOICE_ID,
                val: this.id,
              }),
              ...builders,
              new AddChoice({}),
            ],
          }),
        }),
        // TODO: Decide whether to Wait vs. Deleting input in next machine to avoid the cascading input problem
        // Wait until next tick to avoid cascading input
        new Wait({}),
        // Check if the incoming input is a matching choice
        createStoryMachine((context: Context) => {
          const { input } = context;
          if (!input || input.type !== "Choice") {
            return { status: "Running" };
          }
          if (input.payload.id !== this.id) {
            return { status: "Terminated" };
          }
          return { status: "Completed" };
        }),
        // Present outcome to user if it exists
        ...nodes,
      ],
    });
  }
  process(context: Context): Result {
    return this.processor.process(context);
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
  return node instanceof ChoiceBuilder;
}
