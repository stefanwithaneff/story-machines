import { StoryMachine, StoryMachineAttributes } from "./story-machine";

export interface CompositeMachineAttributes extends StoryMachineAttributes {
  children: StoryMachine[];
}

export abstract class CompositeMachine<
  A extends CompositeMachineAttributes = CompositeMachineAttributes
> extends StoryMachine<A> {
  protected children: StoryMachine[];
  constructor(attributes: A) {
    super(attributes);

    this.children = attributes.children;
  }
}
