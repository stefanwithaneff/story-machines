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
import { CHOICE_BUILDER, CHOICE_ID } from "./constants";
import { isOfType } from "../../utils/tree-utils";
import { ProcessorMachine } from "../base-classes/processor-machine";

interface ChoiceAttributes extends StoryMachineAttributes {
  builders: StoryMachine[];
  conditions: StoryMachine[];
  nodes: StoryMachine[];
}

export class Choice extends ProcessorMachine<ChoiceAttributes> {
  protected createProcessor() {
    const { builders, conditions, nodes } = this.attrs;
    return new MemorySequence({
      id: this.generateId("memory_seq"),
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
        new Wait({ id: this.generateId("wait") }),
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
