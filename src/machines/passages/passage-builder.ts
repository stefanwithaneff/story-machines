import {
  StoryMachine,
  StoryMachineAttributes,
} from "../base-classes/story-machine";

export abstract class PassageBuilder<
  T extends StoryMachineAttributes = StoryMachineAttributes
> extends StoryMachine<T> {}
