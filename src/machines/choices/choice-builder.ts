import {
  StoryMachine,
  StoryMachineAttributes,
} from "../base-classes/story-machine";

export abstract class ChoiceBuilder<
  T extends StoryMachineAttributes = StoryMachineAttributes
> extends StoryMachine<T> {}
