import { Context, Result } from "../types";
import { createStoryMachine } from "../utils/create-story-machine";
import { ValidationError } from "../utils/errors";
import {
  CompositeMachine,
  CompositeMachineAttributes,
} from "./base-classes/composite-machine";
import { StoryMachine } from "./base-classes/story-machine";
import { AddChoice } from "./base-machines/add-choice";
import { DeleteContext } from "./base-machines/delete-context";
import { Once } from "./base-machines/once";
import { Sequence } from "./base-machines/sequence";
import { SetContext } from "./base-machines/set-context";
import { Wait } from "./base-machines/wait";
import { ChoiceText } from "./choice-text";

interface ChoiceAttributes extends CompositeMachineAttributes {
  choiceId?: string;
  outcome?: StoryMachine;
}
export class Choice extends CompositeMachine<ChoiceAttributes> {
  private processor: StoryMachine;

  constructor(attrs: ChoiceAttributes) {
    super(attrs);

    const conditions: StoryMachine[] = [];
    const choiceBuilders = attrs.children.filter(isChoiceBuilder);

    const outcomeNodes = attrs.children.filter(
      (node) => !isChoiceBuilder(node)
    );

    if (outcomeNodes.length > 1) {
      throw new ValidationError(
        `Too many outcome nodes. Expected 1 or 0. Got ${outcomeNodes.length}`
      );
    }

    this.processor = new Sequence({
      children: [
        // Present Choice to user
        new Once({
          child: new Sequence({
            children: [
              ...conditions,
              new SetContext({
                key: "choiceId",
                val: attrs.choiceId ?? this.id,
              }),
              ...choiceBuilders,
              new AddChoice({}),
              new DeleteContext({ key: "choiceId" }),
              new DeleteContext({ key: "choiceText" }),
              new DeleteContext({ key: "choiceMetadata" }),
            ],
          }),
        }),
        // Wait one tick to avoid cascading input
        new Wait({}),
        // Check if the incoming input is a matching choice
        new Once({
          child: createStoryMachine((context: Context) => {
            const { input } = context;
            if (!input || input.type !== "Choice") {
              return { status: "Running" };
            }
            if (input.payload.id !== attrs.id) {
              return { status: "Terminated" };
            }
            return { status: "Completed" };
          }),
        }),
        // Present outcome to user if it exists
        ...outcomeNodes,
      ],
    });
  }

  process(context: Context): Result {
    return this.processor.process(context);
  }
}

function isChoiceBuilder(node: StoryMachine): boolean {
  const choiceBuilderClasses: Function[] = [ChoiceText];

  return choiceBuilderClasses.includes(node.constructor);
}
