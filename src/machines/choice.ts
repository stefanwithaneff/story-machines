import { nanoid } from "nanoid";
import { StoryMachineRuntime } from "../runtime";
import { Context, ElementTree } from "../types";
import { createStoryMachine } from "../utils/create-story-machine";
import { ValidationError } from "../utils/errors";
import { CompositeMachineAttributes } from "./base-classes/composite-machine";
import {
  StoryMachine,
  StoryMachineCompiler,
} from "./base-classes/story-machine";
import { AddChoice } from "./base-machines/add-choice";
import { DeleteContext } from "./base-machines/delete-context";
import { ImmediateSequence } from "./base-machines/immediate-sequence";
import { MemorySequence } from "./base-machines/memory-sequence";
import { SetContext } from "./base-machines/set-context";
import { Wait } from "./base-machines/wait";
import { ChoiceText } from "./choice-text";

interface ChoiceAttributes extends CompositeMachineAttributes {
  choiceId?: string;
}

export const ChoiceCompiler: StoryMachineCompiler = {
  compile(runtime: StoryMachineRuntime, tree: ElementTree<ChoiceAttributes>) {
    const children = runtime.compileChildElements(tree.elements);
    const conditions: StoryMachine[] = [];
    const choiceBuilders = children.filter(isChoiceBuilder);

    const outcomeNodes = children.filter((node) => !isChoiceBuilder(node));

    if (outcomeNodes.length > 1) {
      throw new ValidationError(
        `Too many outcome nodes. Expected 1 or 0. Got ${outcomeNodes.length}`
      );
    }

    const id = tree.attributes.choiceId ?? tree.attributes.id ?? nanoid();

    return new MemorySequence({
      children: [
        // Present Choice to user
        new ImmediateSequence({
          children: [
            ...conditions,
            new SetContext({
              key: "choiceId",
              val: id,
            }),
            ...choiceBuilders,
            new AddChoice({}),
            // TODO: Is there a better way to handle this kind of scoping and cleanup?
            new DeleteContext({ key: "choiceId" }),
            new DeleteContext({ key: "choiceText" }),
            new DeleteContext({ key: "choiceMetadata" }),
          ],
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
  const choiceBuilderClasses: Function[] = [ChoiceText];

  return choiceBuilderClasses.includes(node.constructor);
}
