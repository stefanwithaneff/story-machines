import { StoryMachine, StoryMachineAttributes } from "./story-machine";

export interface SimpleCompositeAttributes extends StoryMachineAttributes {
  children: StoryMachine[];
}

export abstract class CompositeMachine<
  A extends SimpleCompositeAttributes = SimpleCompositeAttributes
> extends StoryMachine<A> {
  protected children: StoryMachine[];
  constructor(attributes: A) {
    super(attributes);

    this.children = attributes.children;
  }
}
