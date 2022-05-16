import { StoryMachine, StoryMachineAttributes } from "./story-machine";

export interface DecoratorAttributes extends StoryMachineAttributes {
  child: StoryMachine;
}

export abstract class DecoratorMachine<
  A extends DecoratorAttributes = DecoratorAttributes
> extends StoryMachine<A> {
  protected child: StoryMachine;

  constructor(attributes: A) {
    super(attributes);

    this.child = attributes.child;
  }
}
