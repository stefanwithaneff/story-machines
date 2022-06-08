import { nanoid } from "nanoid";
import { Context } from "../../types";
import { createStoryMachine } from "../../utils/create-story-machine";
import { ValidationError } from "../../utils/errors";
import {
  StoryMachine,
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

export const ChoiceCompiler: StoryMachineCompiler = {
  compile(runtime, tree) {
    const children = runtime.compileChildElements(tree.elements);
    const conditions: StoryMachine[] = children.filter(
      (node) => node.constructor === Condition
    );

    const choiceBuilders = children.filter(isChoiceBuilder);

    const outcomeNodes = children.filter(
      (node) => !choiceBuilders.includes(node) && !conditions.includes(node)
    );

    if (outcomeNodes.length > 1) {
      throw new ValidationError(
        `Too many outcome nodes. Expected 1 or 0. Got ${outcomeNodes.length}`
      );
    }

    const id = tree.attributes.choiceId ?? tree.attributes.id ?? nanoid();

    return new MemorySequence({
      children: [
        // Present Choice to user
        new Scoped({
          child: new Sequence({
            children: [
              ...conditions,
              new SetContext({
                key: "choiceId",
                val: id,
              }),
              ...choiceBuilders,
              new AddChoice({}),
            ],
          }),
        }),
        // Wait until next tick to avoid cascading input
        new Wait({}),
        // Check if the incoming input is a matching choice
        createStoryMachine((context: Context) => {
          const { input } = context;
          if (!input || input.type !== "Choice") {
            return { status: "Running" };
          }
          if (input.payload.id !== id) {
            return { status: "Terminated" };
          }
          return { status: "Completed" };
        }),
        // Present outcome to user if it exists
        ...outcomeNodes,
      ],
    });
  },
};

function isChoiceBuilder(node: StoryMachine): boolean {
  return node instanceof ChoiceBuilder;
}
